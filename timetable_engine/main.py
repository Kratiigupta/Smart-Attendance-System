from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ortools.sat.python import cp_model

app = FastAPI(title="SmartEdu AI Timetable Optimization Engine", version="1.0.0")

class CourseInput(BaseModel):
    id: str
    title: str
    teacher_id: str
    credits: Optional[int] = 3

class RoomInput(BaseModel):
    id: str
    name: str
    capacity: Optional[int] = 50

class TeacherInput(BaseModel):
    id: str
    name: str

class OptimizationInput(BaseModel):
    courses: List[CourseInput]
    rooms: List[RoomInput]
    slots: List[str]
    teachers: List[TeacherInput]

@app.get("/health")
def health_check():
    return {"status": "online", "engine": "Google OR-Tools CP-SAT Solver"}

@app.post("/optimize")
def optimize_timetable(data: OptimizationInput):
    courses = data.courses
    rooms = data.rooms
    slots = data.slots
    teachers = data.teachers

    if not courses or not rooms or not slots:
        raise HTTPException(status_code=400, detail="Courses, rooms, and slots must be provided.")

    model = cp_model.CpModel()

    # Variables: x[c, r, s] = 1 if course c is assigned to room r at slot s
    x = {}
    for c in courses:
        for r in rooms:
            for s in slots:
                x[c.id, r.id, s] = model.NewBoolVar(f'x_{c.id}_{r.id}_{s}')

    # Constraint 1: Each course is scheduled exactly once
    for c in courses:
        model.Add(sum(x[c.id, r.id, s] for r in rooms for s in slots) == 1)

    # Constraint 2: At most one course in a room at any slot
    for r in rooms:
        for s in slots:
            model.Add(sum(x[c.id, r.id, s] for c in courses) <= 1)

    # Constraint 3: No teacher conflict (teacher teaches at most one class at any slot)
    for t in teachers:
        for s in slots:
            # Get all courses taught by this teacher
            teacher_courses = [c for c in courses if c.teacher_id == t.id]
            if teacher_courses:
                model.Add(sum(x[c.id, r.id, s] for c in teacher_courses for r in rooms) <= 1)

    # Solve the model
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        scheduled_classes = []
        for c in courses:
            for r in rooms:
                for s in slots:
                    if solver.BooleanValue(x[c.id, r.id, s]):
                        room_obj = next((rm for rm in rooms if rm.id == r.id), None)
                        teacher_obj = next((tch for tch in teachers if tch.id == c.teacher_id), None)
                        scheduled_classes.append({
                            "course_id": c.id,
                            "course_title": c.title,
                            "room_id": r.id,
                            "room_name": room_obj.name if room_obj else "Unknown Room",
                            "teacher_id": c.teacher_id,
                            "teacher_name": teacher_obj.name if teacher_obj else "Unknown Instructor",
                            "slot": s
                        })
        return {
            "status": "optimized",
            "message": "AI Solver successfully solved timetable constraints.",
            "timetable": scheduled_classes
        }
    else:
        return {
            "status": "infeasible",
            "message": "No optimal conflict-free solution could be solved with the current constraints (excess courses or insufficient rooms/slots).",
            "timetable": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
