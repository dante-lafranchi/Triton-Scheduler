from django.shortcuts import render
from django.http import HttpResponse
from .models import SharedData, Course, Section

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import json
import requests
import os

# Create your views here.

def find_class(request, sub_and_crse_code):
    if request.method == 'GET':
        split_sub_and_crse_code = sub_and_crse_code.split(' ')

        if len(split_sub_and_crse_code) != 2:
            return JsonResponse({'error': 'Invalid sub_and_crse_code'}, status=400)
        
        subject, crse_code = map(str, split_sub_and_crse_code)
        padded_subject = subject.strip().ljust(4).upper()
        padded_crse_code = ''

        num_digits = sum(1 for char in crse_code if char.isdigit())

        if num_digits == 1:
            padded_crse_code += '  ' + crse_code.strip()
        elif num_digits == 2:
            padded_crse_code += ' ' + crse_code.strip()

        padded_crse_code = padded_crse_code.ljust(5).upper()

        from django.core.cache import caches

        try:
            redis_client = caches['default'].client.get_client()
            cookies = redis_client.hgetall('cookies')

            url = f'https://act.ucsd.edu/webreg2/svc/wradapter/secure/search-load-group-data/?subjcode={padded_subject}&crsecode={padded_crse_code}&termcode=FA23'

            sections = requests.get(url, cookies=cookies)
        except Exception as e:
            return JsonResponse({'error': 'There was an error gettin the class data. Please try again.'}, status=400)

        if not sections or sections.text == '[]':
            return JsonResponse({'error': 'Class not found'}, status=400)
        
        try:
            courses_overviews_file_path = os.path.join(os.environ.get("HOME"), "backend", "scheduler", "capes_scraper", "data", "course_overviews.json")
            with open(courses_overviews_file_path, 'r') as file:
                course_overviews = json.load(file)
                course_overview = course_overviews.get(sub_and_crse_code, {})

            courses_review_data_file_path = os.path.join(os.environ.get("HOME"), "backend", "scheduler", "capes_scraper", "data", "courses_review_data.json")
            with open(courses_review_data_file_path, 'r') as file:
                courses_review_data = json.load(file)      
        except Exception as e:
            return JsonResponse({'error': 'There was an error getting the course review data. Please try again.'}, status=400)

        def is_undergrad_course(course_code):
            if not course_code.startswith('1') and len(course_code) >= 3:
                if course_code[-1].isdigit() and len(course_code) == 3:
                    return False  
                if not course_code[-1].isdigit() and (len(course_code) == 4 or len(course_code) == 5):
                    return False 
            return True 

        # graduate courses don't have review data
        if is_undergrad_course(crse_code):
            course_overview = {**course_overview, **courses_review_data.get(sub_and_crse_code, {})}

        return JsonResponse({'sections': sections.text, 'course_overview': course_overview})

@login_required
def create_course(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))

        sub_and_crse_code = data.get('subAndCrseCode')

        user = request.user

        course = Course(sub_and_crse_code=sub_and_crse_code, user=user)
        course.save()

        return JsonResponse(course.format())
    else:
        return JsonResponse({'error': 'Must be POST request'}, status=400)
    
@login_required
def create_section(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))

        sect_code = data.get('sectCode')
        course_id = data.get('courseId')

        course = Course.objects.filter(id=course_id).first()

        if course:
            section = Section(sect_code=sect_code, course=course)
            section.save()

            return JsonResponse(section.format())
        else:
            return JsonResponse({'error': 'Course does not exist'}, status=400)
    else:
        return JsonResponse({'error': 'Must be POST request'}, status=400)
    
@login_required
def get_courses(request):
    if request.method == 'GET':
        user = request.user
        courses = Course.objects.filter(user=user)

        return JsonResponse([course.format() for course in courses], safe=False)
    else:
        return JsonResponse({'error': 'Must be GET request'}, status=400)
    
@login_required
def get_sections_for_course(request, course_id):
    if request.method == 'GET':
        course = Course.objects.filter(id=course_id).first()

        if course:
            sections = Section.objects.filter(course=course)

            return JsonResponse([section.format() for section in sections], safe=False)
        else:
            return JsonResponse({'error': 'Course does not exist'}, status=400)
    else:
        return JsonResponse({'error': 'Must be GET request'}, status=400)
    
@login_required
def delete_course(request, course_id):
    if request.method == 'DELETE':
        course = Course.objects.filter(id=course_id).first()

        if course:
            course.delete()

            return JsonResponse({'success': True}, status=200)
        else:
            return JsonResponse({'error': 'Course does not exist'}, status=400)
    else:
        return JsonResponse({'error': 'Must be DELETE request'}, status=400)

@login_required
def delete_section(request, section_id):
    if request.method == 'DELETE':
        section = Section.objects.filter(id=section_id).first()

        if section:
            section.delete()

            return JsonResponse({'success': True}, status=200)
        else:
            return JsonResponse({'error': 'Section does not exist'}, status=400)
    else:
        return JsonResponse({'error': 'Must be DELETE request'}, status=400)
    
def get_professor_ratings(request, prof_name):
    if request.method == 'GET':
        prof_name = prof_name.replace(',', '')

        professors_review_file_path = os.path.join(os.environ.get("HOME"), "backend", "scheduler", "capes_scraper", "data", "professors_review_data.json")

        with open(professors_review_file_path, 'r') as file:
            professors_review_data = json.load(file)

        return JsonResponse(professors_review_data.get(prof_name, {}))
    else:
        return JsonResponse({'error': 'Must be GET request'}, status=400)