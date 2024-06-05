from django.contrib import admin
from django.urls import path, include
from api.views import MistakeSearchByRegexView, FactorSearchByRegexView, UserDetailsFetch, UserContactView
from api.views import (CreateUserView, ListUserView,
                       CreateCustomMistakeFactorView, ListMistakesView, ListFactorView,
                       RelatedFactorSearchView, FetchMistakeStatsView,FetchFactorStatsView,)
from habits.views import(HabitListAPIView, FetchLast7DaysLogsView, UpdateHabitLogsView,)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    
    path('admin/', admin.site.urls),
    
    path('contactme/', UserContactView, name='contactme'),
    
    path('getUserData/',UserDetailsFetch.as_view(), name='getUserData'),
    path('habit/createOne/', HabitListAPIView.as_view(), name='createOneHabit'),
    path('habit/last7days/',FetchLast7DaysLogsView.as_view(), name='last7days'),
    path('habit/updatelogs/',UpdateHabitLogsView.as_view(),name='updatelogs'),
    
    path("api/regex/mistake/", MistakeSearchByRegexView.as_view(),
         name="mistake_regex"),
    path("api/regex/factor/", FactorSearchByRegexView.as_view(), name="factor_regex"),

    path('api/fetch/mistakestats/',
         FetchMistakeStatsView.as_view(), name="mistake_logs"),
    
    path('api/fetch/mistakestats/facts/', FetchFactorStatsView.as_view(), name="fact_logs"),

    path("api/create/newMisfact/", CreateCustomMistakeFactorView.as_view(),
         name='custommistakefactor'),
    path("searchRelatedFactor/", RelatedFactorSearchView.as_view(),
         name="searchRelatedFactors"),

    path("api/list/mistake/", ListMistakesView.as_view(), name='list_mistakes'),
    path("api/list/factor/", ListFactorView.as_view(), name='list_factor'),

    path("api/user/register/", CreateUserView.as_view(), name='register'),
    path('api/list/users/', ListUserView.as_view(), name='list'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('api-auth/', include("rest_framework.urls")),
]
