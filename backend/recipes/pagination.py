"""
Custom pagination class for recipe API endpoints.
Allows clients to specify page size via query parameters.
"""
from rest_framework.pagination import PageNumberPagination


class RecipePagination(PageNumberPagination):
    """
    Custom pagination that respects the page_size query parameter.
    
    Default: 20 items per page
    Max: 100 items per page
    Query param: ?page_size=10
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

