import pandas as pd
import json

class Course:
    def __init__(self, course_code):
        self.course_code = course_code
        self.study_hours_per_week = []
        self.average_grade_received = []

    def add_data(self, study_hours, grade_received):
        if not pd.isna(study_hours):
            self.study_hours_per_week.append(study_hours)

        if not pd.isna(grade_received):
            self.average_grade_received.append(grade_received)

class Professor: 
    def __init__(self, name):
        self.name = name
        self.study_hours_per_week = []
        self.average_grade_received = []
        self.recommend_professor_percentage = []
        self.professor_courses = {}

    def add_data(self, study_hours, grade_received, recommend_professor_percentage, course_code):
        if course_code not in self.professor_courses:
            self.professor_courses[course_code] = {
                "study_hours_per_week": [],
                "average_grade_received": [],
                "recommend_professor_percentage": []
            }

        self.recommend_professor_percentage.append(recommend_professor_percentage)
        self.professor_courses[course_code]["recommend_professor_percentage"].append(recommend_professor_percentage)

        if not pd.isna(study_hours):
            self.study_hours_per_week.append(study_hours)
            self.professor_courses[course_code]["study_hours_per_week"].append(study_hours)

        if not pd.isna(grade_received):
            self.average_grade_received.append(grade_received)
            self.professor_courses[course_code]["average_grade_received"].append(grade_received)

courses = {}
professors = {}

df = pd.read_csv('./capes_data.csv')

# delete summer term rows
df = df[~df['Term'].str.startswith('S1')]
df = df[~df['Term'].str.startswith('S2')]

def extract_course_code(course_name):
    return course_name.split('-')[0].strip()

def extract_grade_received(grade_received):
    return float(grade_received.split(' ')[1][1:5]) if ' ' in str(grade_received) else None # remove letter grade
    
def extract_recommend_professor_percentage(recommend_professor_percentage):
    return float(recommend_professor_percentage[:-1]) # remove % sign

df['Course'] = df['Course'].apply(extract_course_code)
df['Average Grade Received'] = df['Average Grade Received'].apply(extract_grade_received)
df['Recommend Professor Percentage'] = df['Recommend Professor Percentage'].apply(extract_recommend_professor_percentage)

for index, row in df.iterrows():
    course_code = row['Course']
    study_hours = row['Study Hours Per Week']
    grade_received = row['Average Grade Received']
    professor_name = row['Professor']
    recommend_professor_percentage = row['Recommend Professor Percentage']
    
    if course_code not in courses:
        courses[course_code] = Course(course_code)
    courses[course_code].add_data(study_hours, grade_received)

    if professor_name not in professors:
        professors[professor_name] = Professor(professor_name)
    professors[professor_name].add_data(study_hours, grade_received, recommend_professor_percentage, course_code)

def gpa_to_letter_grade(gpa):
    if gpa >= 4.0:
        return 'A+'
    elif gpa >= 3.85:
        return 'A'
    elif gpa >= 3.7:
        return 'A-'
    elif gpa >= 3.3:
        return 'B+'
    elif gpa >= 3.0:
        return 'B'
    elif gpa >= 2.7:
        return 'B-'
    elif gpa >= 2.3:
        return 'C+'
    elif gpa >= 2.0:
        return 'C'
    elif gpa >= 1.7:
        return 'C-'
    elif gpa >= 1.0:
        return 'D'
    else:
        return 'F'
    
def calculate_average(data_list):
    if (len(data_list) == 0):
        return 0
    else:
        return round(sum(data_list) / len(data_list), 2)

for course in courses.values():
    course.study_hours_per_week = calculate_average(course.study_hours_per_week)
    course.average_grade_received = calculate_average(course.average_grade_received)

    letter_grade = gpa_to_letter_grade(course.average_grade_received)
    course.average_grade_received = letter_grade + f' ({course.average_grade_received})'

for professor in professors.values():
    professor.study_hours_per_week = calculate_average(professor.study_hours_per_week)
    professor.recommend_professor_percentage = calculate_average(professor.recommend_professor_percentage)
    professor.average_grade_received = calculate_average(professor.average_grade_received)

    letter_grade = gpa_to_letter_grade(professor.average_grade_received)
    professor.average_grade_received = letter_grade + f' ({professor.average_grade_received})'

    for course in professor.professor_courses.values():
        course['study_hours_per_week'] = calculate_average(course['study_hours_per_week'])
        course['recommend_professor_percentage'] = calculate_average(course['recommend_professor_percentage'])
        course['average_grade_received'] = calculate_average(course['average_grade_received'])

        letter_grade = gpa_to_letter_grade(course['average_grade_received'])
        course['average_grade_received'] = letter_grade + f' ({course["average_grade_received"]})'

course_data = {}
for course_code, course in courses.items():
    course_data[course_code] = {
        "study_hours_per_week": course.study_hours_per_week,
        "average_grade_received": course.average_grade_received
    }

professor_data = {}
for professor_name, professor in professors.items():
    professor_data[professor_name] = {
        "study_hours_per_week": professor.study_hours_per_week,
        "average_grade_received": professor.average_grade_received,
        "recommend_professor_percentage": professor.recommend_professor_percentage,
        "professor_courses": professor.professor_courses
    }

with open('courses_review_data.json', 'w') as file:
    json.dump(course_data, file)

with open('professors_review_data.json', 'w') as file:
    json.dump(professor_data, file)