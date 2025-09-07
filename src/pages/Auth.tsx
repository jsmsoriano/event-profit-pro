import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { TestingModePanel } from '@/components/auth/TestingModePanel';
import { TEST_ACCOUNTS, TestAccountRole } from '@/config/testAccounts';
import { isAuthError, shouldRetryLogin, logAuthAttempt } from '@/utils/authErrors';
import { AUTH_CONFIG } from '@/constants/auth';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<TestAccountRole>('customer');
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
  const handleTestLogin = useCallback(async () => {
    setLoading(true);
    
    const testAccount = TEST_ACCOUNTS[role];
    
    try {
      logAuthAttempt('test login attempt', testAccount.email, false);
      
      // Try to sign in first
      const { error: signInError } = await signIn(testAccount.email, testAccount.password);
      
      if (signInError && shouldRetryLogin(signInError)) {
        // If account doesn't exist or needs confirmation, create it
        logAuthAttempt('creating test account', testAccount.email, false);
        
        const { error: signUpError } = await signUp(testAccount.email, testAccount.password, {
          first_name: testAccount.firstName,
          last_name: testAccount.lastName,
          role: role,
        });
        
        if (signUpError) {
          logAuthAttempt('test account creation', testAccount.email, false);
        } else {
          logAuthAttempt('test account creation', testAccount.email, true);
          
          // After successful signup, try to sign in again
          setTimeout(async () => {
            const { error: secondSignInError } = await signIn(testAccount.email, testAccount.password);
            if (!secondSignInError) {
              logAuthAttempt('test login retry', testAccount.email, true);
              navigate('/');
            } else {
              logAuthAttempt('test login retry', testAccount.email, false);
            }
          }, AUTH_CONFIG.RETRY_DELAY);
        }
      } else if (!signInError) {
        logAuthAttempt('test login', testAccount.email, true);
        navigate('/');
      } else {
        logAuthAttempt('test login', testAccount.email, false);
      }
    } catch (error) {
      logAuthAttempt('test login error', testAccount.email, false);
    }
    
    setLoading(false);
  }, [role, signIn, signUp, navigate]);

  useEffect(() => {
    if (testingMode && !user && !loading) {
      handleTestLogin();
    }
  }, [testingMode, user, loading, handleTestLogin]);

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/');
    }
    
    setLoading(false);
  }, [email, password, signIn, navigate]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      role: role,
    });
    
    setLoading(false);
  }, [email, password, firstName, lastName, role, signUp]);

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
              <SignInForm
                email={email}
                password={password}
                loading={loading}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={handleSignIn}
              />
              
              <TestingModePanel
                testingMode={testingMode}
                role={role}
                onTestingModeChange={setTestingMode}
                onRoleChange={setRole}
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm
                firstName={firstName}
                lastName={lastName}
                email={email}
                password={password}
                loading={loading}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={handleSignUp}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}