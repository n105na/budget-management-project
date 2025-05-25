from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Personnel, Grade, Wilaya

User = get_user_model()

class RoleBasedPermissionTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create test users
        self.doyen_user = User.objects.create_user(
            username='doyen_test',
            password='testpass123',
            role=User.Role.DOYEN
        )
        
        self.commission_user = User.objects.create_user(
            username='commission_test',
            password='testpass123',
            role=User.Role.COMMISSION
        )
        
        self.secretaire_user = User.objects.create_user(
            username='secretaire_test',
            password='testpass123',
            role=User.Role.SECRETAIRE_GENERALE
        )
        
        self.comptable_user = User.objects.create_user(
            username='comptable_test',
            password='testpass123',
            role=User.Role.COMPTABLE
        )
        
        # Create test data if needed
        # You might need to create Grade and Wilaya objects first
        
        self.client = APIClient()
    
    def test_doyen_can_only_view(self):
        """Test that Doyen users can only perform GET requests"""
        self.client.force_authenticate(user=self.doyen_user)
        
        # GET should work
        response = self.client.get('/api/personnel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # POST should fail
        response = self.client.post('/api/personnel/', {'name': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_commission_can_only_view(self):
        """Test that Commission users can only perform GET requests"""
        self.client.force_authenticate(user=self.commission_user)
        
        # GET should work
        response = self.client.get('/api/personnel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # POST should fail
        response = self.client.post('/api/personnel/', {'name': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_secretaire_can_edit(self):
        """Test that Secretaire Generale users can perform all operations"""
        self.client.force_authenticate(user=self.secretaire_user)
        
        # GET should work
        response = self.client.get('/api/personnel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # POST should work (adjust data based on your model requirements)
        personnel_data = {
            'name': 'Test Personnel',
            'profession': 'Teacher',
            # Add other required fields
        }
        response = self.client.post('/api/personnel/', personnel_data)
        # Should be 201 Created or might be 400 if required fields are missing
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
    
    def test_comptable_can_edit(self):
        """Test that Comptable users can perform all operations"""
        self.client.force_authenticate(user=self.comptable_user)
        
        # GET should work
        response = self.client.get('/api/personnel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # POST should work
        personnel_data = {
            'name': 'Test Personnel',
            'profession': 'Teacher',
            # Add other required fields
        }
        response = self.client.post('/api/personnel/', personnel_data)
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
    
    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated users cannot access the API"""
        response = self.client.get('/api/personnel/')
        # With custom permissions, unauthenticated users get 403 instead of 401
        # This is because our RoleBasedPermission checks authentication first
        # and returns False (403) rather than raising an authentication error (401)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
