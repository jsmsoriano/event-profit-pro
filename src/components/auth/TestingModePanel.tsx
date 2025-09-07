import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestAccountRole, TEST_ACCOUNTS } from '@/config/testAccounts';

interface TestingModePanelProps {
  testingMode: boolean;
  role: TestAccountRole;
  onTestingModeChange: (enabled: boolean) => void;
  onRoleChange: (role: TestAccountRole) => void;
}

export function TestingModePanel({
  testingMode,
  role,
  onTestingModeChange,
  onRoleChange
}: TestingModePanelProps) {
  return (
    <>
      {/* Testing Mode Toggle */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label htmlFor="testing-mode" className="text-sm font-medium">
            Testing Mode (Auto-Login)
          </Label>
          <Switch
            id="testing-mode"
            checked={testingMode}
            onCheckedChange={onTestingModeChange}
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
              <Select value={role} onValueChange={onRoleChange}>
                <SelectTrigger className="input-modern bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="customer">Customer View</SelectItem>
                  <SelectItem value="admin">Admin View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Test Account:</strong><br/>
                {TEST_ACCOUNTS[role].email}<br/>
                <span className="text-green-600">✓ Auto-login configured</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}