from django.urls import path
from . import views

urlpatterns = [
    path('create_course/', views.create_course, name='create_course'),
    path('create_section/', views.create_section, name='create_section'),
    path('get_courses/', views.get_courses, name='get_courses'),
    path('get_sections_for_course/<int:course_id>/', views.get_sections_for_course, name='get_sections_for_course'),
    path('delete_course/<int:course_id>/', views.delete_course, name='delete_course'),
    path('delete_section/<int:section_id>/', views.delete_section, name='delete_section'),
    path('get_professor_ratings/<str:prof_name>/', views.get_professor_ratings, name='get_professor_ratings'),
    path('find_class/<str:sub_and_crse_code>/', views.find_class, name='find_class'),
]