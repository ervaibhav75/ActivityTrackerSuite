from rest_framework import permissions


class AdminOrReadOnly(permissions.IsAdminUser):
    def has_permission(self, request, view):
       
        if request.method in permissions.SAFE_METHODS:
            return True
        # or admin_permission = super().has_permission(request, view) because in superclass same code is there
        return bool(request.user and request.user.is_staff)


class AuthorOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is authenticated (has an access token)
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Ensure the object's author matches the request user
        return obj.author == request.user