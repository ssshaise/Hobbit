import os
from fastapi import FastAPI, HTTPException
from sqlmodel import Field, Session, SQLModel, create_engine, select
from datetime import date, timedelta
from typing import Optional, List
from twilio.rest import Client
from fastapi.middleware.cors import CORSMiddleware
from calendar import monthrange
import sys
import ctypes

if sys.platform == "win32":
    kernel32 = ctypes.WinDLL('kernel32')
    user32 = ctypes.WinDLL('user32')
    hWnd = kernel32.GetConsoleWindow()
    if hWnd:
        user32.ShowWindow(hWnd, 0)

# --- SMART DATABASE CONFIG ---
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./habits.db")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# TWILIO CONFIG
TWILIO_SID = os.environ.get("TWILIO_SID", "YOUR_SID_HERE")
TWILIO_AUTH = os.environ.get("TWILIO_AUTH", "YOUR_AUTH_HERE")
TWILIO_FROM = os.environ.get("TWILIO_FROM", "+1234567890")

# --- DATABASE MODELS ---
class Habit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    created_at: date = Field(default_factory=date.today)

class DailyLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habit.id")
    date_logged: date
    status: bool = False
    note: Optional[str] = None

class WeeklyGoal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    week_start: date
    target_count: int = 15

class UserSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone_number: Optional[str] = None
    reminders_enabled: bool = False

# --- SETUP ---
engine = create_engine(DATABASE_URL)
SQLModel.metadata.create_all(engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPER: SMS ---
def send_sms(to_number: str, body: str):
    if not TWILIO_SID or "YOUR" in TWILIO_SID:
        print(f"[LOG] SMS to {to_number}: {body}")
        return
    try:
        client = Client(TWILIO_SID, TWILIO_AUTH)
        client.messages.create(body=body, from_=TWILIO_FROM, to=to_number)
    except Exception as e:
        print(f"Twilio Error: {e}")

# --- ENDPOINTS ---
@app.get("/habits")
def get_habits():
    with Session(engine) as session:
        return session.exec(select(Habit)).all()

@app.post("/habits")
def create_habit(habit: Habit):
    with Session(engine) as session:
        session.add(habit)
        session.commit()
        session.refresh(habit)
        return habit

@app.get("/logs")
def get_logs(start: date, end: date):
    with Session(engine) as session:
        statement = select(DailyLog).where(
            DailyLog.date_logged >= start, 
            DailyLog.date_logged <= end
        )
        return session.exec(statement).all()

@app.post("/toggle")
def toggle_habit(habit_id: int, day: date, note: Optional[str] = None):
    with Session(engine) as session:
        statement = select(DailyLog).where(
            DailyLog.habit_id == habit_id, 
            DailyLog.date_logged == day
        )
        existing = session.exec(statement).first()
        
        if existing:
            existing.status = not existing.status
            if note is not None: existing.note = note
            session.add(existing)
        else:
            new_log = DailyLog(habit_id=habit_id, date_logged=day, status=True, note=note)
            session.add(new_log)
        session.commit()
        return {"status": "updated"}

@app.get("/goal/{week_start}")
def get_goal(week_start: date):
    with Session(engine) as session:
        goal = session.exec(select(WeeklyGoal).where(WeeklyGoal.week_start == week_start)).first()
        if not goal:
            goal = WeeklyGoal(week_start=week_start, target_count=15)
            session.add(goal)
            session.commit()
        return goal

@app.post("/goal")
def update_goal(goal: WeeklyGoal):
    with Session(engine) as session:
        existing = session.exec(select(WeeklyGoal).where(WeeklyGoal.week_start == goal.week_start)).first()
        if existing:
            existing.target_count = goal.target_count
            session.add(existing)
        else:
            session.add(goal)
        session.commit()
        return {"status": "updated"}

@app.get("/user/settings")
def get_settings():
    with Session(engine) as session:
        settings = session.exec(select(UserSettings)).first()
        if not settings:
            settings = UserSettings(phone_number="", reminders_enabled=False)
            session.add(settings)
            session.commit()
        return settings

@app.post("/user/settings")
def update_settings(settings: UserSettings):
    with Session(engine) as session:
        existing = session.exec(select(UserSettings)).first()
        if existing:
            existing.phone_number = settings.phone_number
            existing.reminders_enabled = settings.reminders_enabled
            session.add(existing)
        else:
            session.add(settings)
        session.commit()
        if settings.reminders_enabled:
            send_sms(settings.phone_number, "Habit Academy: Reminders Enabled! 🚀")
        return {"status": "updated"}

@app.get("/stats/month_breakdown")
def get_month_breakdown(year: int, month: int):
    with Session(engine) as session:
        num_days = monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, num_days)
        
        logs = session.exec(select(DailyLog).where(
            DailyLog.date_logged >= start_date,
            DailyLog.date_logged <= end_date,
            DailyLog.status == True
        )).all()
        
        daily_counts = {day: 0 for day in range(1, num_days + 1)}
        for log in logs:
            day_num = log.date_logged.day
            daily_counts[day_num] += 1
            
        return [{"day": d, "count": c} for d, c in daily_counts.items()]

# --- NEW DELETE ENDPOINT ---
@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int):
    with Session(engine) as session:
        # 1. Check if habit exists
        habit = session.get(Habit, habit_id)
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        
        # 2. Delete all logs associated with this habit first
        # (Otherwise you get orphaned data or SQL errors)
        statement = select(DailyLog).where(DailyLog.habit_id == habit_id)
        logs = session.exec(statement).all()
        for log in logs:
            session.delete(log)

        # 3. Delete the habit itself
        session.delete(habit)
        session.commit()
        return {"status": "deleted", "id": habit_id}
    
if __name__ == "__main__":
    import uvicorn
    # This starts the server automatically on port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
    
