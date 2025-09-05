import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [testingMode, setTestingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Auto-login bypass for testing mode
  useEffect(() => {
    if (testingMode && !user && !loading) {
      handleTestLogin();
    }
  }, [testingMode, user, loading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/');
    }
    
    setLoading(false);
  };

  // Fixed test accounts for each role
  const testAccounts = {
    customer: {
      email: 'testcustomer@gmail.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Customer'
    },
    admin: {
      email: 'testadmin@gmail.com', 
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Admin'
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    
    const testAccount = testAccounts[role];
    
    try {
      console.log(`Attempting to sign in with: ${testAccount.email}`);
      // Try to sign in first
      const { error: signInError } = await signIn(testAccount.email, testAccount.password);
      
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        // If account doesn't exist, create it
        console.log('Creating test account:', testAccount.email);
        const { error: signUpError } = await signUp(testAccount.email, testAccount.password, {
          first_name: testAccount.firstName,
          last_name: testAccount.lastName,
          role: role,
        });
        
        if (signUpError) {
          console.error('Signup error:', signUpError);
        } else {
          console.log('Test account created successfully, attempting login...');
          // After successful signup, try to sign in again
          setTimeout(async () => {
            const { error: secondSignInError } = await signIn(testAccount.email, testAccount.password);
            if (!secondSignInError) {
              navigate('/');
            } else {
              console.error('Second signin error:', secondSignInError);
            }
          }, 2000);
        }
      } else if (!signInError) {
        console.log('Signed in successfully');
        navigate('/');
      } else {
        console.error('Signin error:', signInError);
      }
    } catch (error) {
      console.error('Test login error:', error);
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      role: role,
    });
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Welcome to Catering Pro
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to manage your catering events and profits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="input-modern"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              {/* Testing Mode Toggle */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="testing-mode" className="text-sm font-medium">
                    Testing Mode (Auto-Login)
                  </Label>
                  <Switch
                    id="testing-mode"
                    checked={testingMode}
                    onCheckedChange={setTestingMode}
                    className="border border-border data-[state=checked]:border-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {testingMode ? `Auto-logging in as ${role}...` : 'Enable to bypass login completely'}
                </p>
              </div>
              
              {/* Testing Mode Section - Only visible when toggle is on */}
              {testingMode && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-center mb-3">
                    <Label className="text-sm text-muted-foreground font-medium">Quick Role Switch</Label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="test-role" className="text-xs">Switch to Role:</Label>
                      <Select value={role} onValueChange={(value: 'customer' | 'admin') => setRole(value)}>
                        <SelectTrigger className="input-modern bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          <SelectItem value="customer">Customer View</SelectItem>
                          <SelectItem value="admin">Admin View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      <strong>Current Test Account:</strong><br/>
                      {testAccounts[role].email}<br/>
                      Password: {testAccounts[role].password}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                      className="input-modern"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={role} onValueChange={(value: 'customer' | 'admin') => setRole(value)}>
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer - Book events and view menu</SelectItem>
                      <SelectItem value="admin">Admin - Full management access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="input-modern"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="input-modern"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}