import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Edit2, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LaborRole {
  id: string;
  name: string;
  laborPercentage: number;
}

interface LaborRoleManagerProps {
  laborRoles: LaborRole[];
  onRolesChange: (roles: LaborRole[]) => void;
  totalBudget?: number;
  gratuityAmount?: number;
}

const LaborRoleManager = ({ laborRoles, onRolesChange, totalBudget = 0, gratuityAmount = 0 }: LaborRoleManagerProps) => {
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePercentage, setNewRolePercentage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPercentage, setEditPercentage] = useState(0);
  const [useDefaults, setUseDefaults] = useState(true);
  const [defaultRoles, setDefaultRoles] = useState<LaborRole[]>([]);
  const { toast } = useToast();

  const totalPercentage = laborRoles.reduce((sum, role) => sum + role.laborPercentage, 0);
  const targetPercentage = 100; // Target is always 100% for budget + gratuity
  const isValidAllocation = Math.abs(totalPercentage - targetPercentage) < 0.01;

  // Load default roles from admin settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const defaultLaborRoles = parsed.laborRoles || [
          { id: 'chef-default', name: 'Chef', laborPercentage: 60 },
          { id: 'assistant-default', name: 'Assistant', laborPercentage: 40 }
        ];
        setDefaultRoles(defaultLaborRoles);
        
        // If no roles and using defaults, set the default roles
        if (laborRoles.length === 0 && useDefaults) {
          onRolesChange(defaultLaborRoles.map(role => ({ ...role, id: `${role.id}-${Date.now()}` })));
        }
      } catch (error) {
        console.error('Error loading default roles:', error);
        const fallbackRoles = [
          { id: 'chef-default', name: 'Chef', laborPercentage: 60 },
          { id: 'assistant-default', name: 'Assistant', laborPercentage: 40 }
        ];
        setDefaultRoles(fallbackRoles);
      }
    }
  }, []);

  const addRole = () => {
    if (!newRoleName.trim() || newRolePercentage <= 0) {
      toast({
        title: "Invalid Role",
        description: "Please enter a valid role name and percentage greater than 0.",
        variant: "destructive"
      });
      return;
    }

    const newTotalPercentage = totalPercentage + newRolePercentage;
    if (newTotalPercentage > 100) {
      toast({
        title: "Allocation Exceeded",
        description: `Adding this role would exceed 100%. You have ${(100 - totalPercentage).toFixed(1)}% remaining.`,
        variant: "destructive"
      });
      return;
    }

    const newRole: LaborRole = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      laborPercentage: newRolePercentage,
    };

    onRolesChange([...laborRoles, newRole]);
    setNewRoleName("");
    setNewRolePercentage(0);
    
    // Switch to manual override if adding custom roles
    if (useDefaults) {
      setUseDefaults(false);
    }
  };

  const removeRole = (id: string) => {
    onRolesChange(laborRoles.filter(role => role.id !== id));
  };

  const startEdit = (role: LaborRole) => {
    setEditingId(role.id);
    setEditName(role.name);
    setEditPercentage(role.laborPercentage);
  };

  const saveEdit = () => {
    if (!editName.trim() || editPercentage <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid role name and percentage greater than 0.",
        variant: "destructive"
      });
      return;
    }

    const currentRole = laborRoles.find(r => r.id === editingId);
    const otherRolesTotal = laborRoles
      .filter(role => role.id !== editingId)
      .reduce((sum, role) => sum + role.laborPercentage, 0);
    
    const newTotalPercentage = otherRolesTotal + editPercentage;
    if (newTotalPercentage > 100) {
      toast({
        title: "Allocation Exceeded",
        description: `This percentage would exceed 100%. Maximum allowed: ${(100 - otherRolesTotal).toFixed(1)}%`,
        variant: "destructive"
      });
      return;
    }

    onRolesChange(
      laborRoles.map(role =>
        role.id === editingId
          ? { ...role, name: editName.trim(), laborPercentage: editPercentage }
          : role
      )
    );
    setEditingId(null);
    
    // Switch to manual override when editing
    if (useDefaults) {
      setUseDefaults(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPercentage(0);
  };

  const handleToggleDefaults = (enabled: boolean) => {
    setUseDefaults(enabled);
    if (enabled) {
      // Load default roles from admin settings
      onRolesChange(defaultRoles.map(role => ({ ...role, id: `${role.id}-${Date.now()}` })));
    } else {
      // Keep current roles for manual override
    }
  };

  const remainingPercentage = Math.max(0, 100 - totalPercentage);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Labor Roles</CardTitle>
        <CardDescription>
          Manage team roles and their percentage of the labor budget (must total 100%)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-3 sm:p-6">
        {/* Default/Override Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Allocation Source</h4>
            <p className="text-xs text-muted-foreground">
              Use default allocations from admin settings or create custom roles
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="use-defaults" className="text-sm font-medium whitespace-nowrap">
              Use Defaults
            </Label>
            <Switch
              id="use-defaults"
              checked={useDefaults}
              onCheckedChange={handleToggleDefaults}
            />
          </div>
        </div>
        {/* Current Roles */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="font-semibold text-sm">Current Roles</h4>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isValidAllocation ? "default" : "destructive"}
                className="text-xs"
              >
                Total: {totalPercentage.toFixed(1)}%
              </Badge>
              {!isValidAllocation && (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )}
            </div>
          </div>

          
          {laborRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {useDefaults ? "No default roles configured. Please set up roles in Admin settings." : "No roles added yet. Add your first role below."}
            </p>
          ) : (
            <div className="space-y-2">
              {laborRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg"
                >
                  {editingId === role.id ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 flex-1"
                        placeholder="Role name"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editPercentage || ""}
                          onChange={(e) => setEditPercentage(Number(e.target.value))}
                          min="0"
                          max="100"
                          step="0.1"
                          className="h-8 w-20"
                          placeholder="0"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-sm truncate">{role.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {role.laborPercentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(role)}
                          className="h-8 w-8 p-0"
                          disabled={useDefaults}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRole(role.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          disabled={useDefaults}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!isValidAllocation && laborRoles.length > 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-xs text-destructive font-medium">
                {totalPercentage < 100 
                  ? `⚠️ Add ${(100 - totalPercentage).toFixed(1)}% more to reach 100%`
                  : `⚠️ Reduce by ${(totalPercentage - 100).toFixed(1)}% to reach 100%`
                }
              </p>
            </div>
          )}
        </div>

        {/* Add New Role - Moved to bottom */}
        {!useDefaults && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm">Add New Role</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="role-name" className="text-xs">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Chef"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="role-percentage" className="text-xs">
                  Percentage (Remaining: {remainingPercentage.toFixed(1)}%)
                </Label>
                <Input
                  id="role-percentage"
                  type="number"
                  placeholder="0"
                  value={newRolePercentage || ""}
                  onChange={(e) => setNewRolePercentage(Number(e.target.value))}
                  min="0"
                  max={remainingPercentage}
                  step="0.1"
                  className="h-9"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addRole}
                  size="sm"
                  className="h-9 w-full"
                  disabled={!newRoleName.trim() || newRolePercentage <= 0 || remainingPercentage <= 0}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Add Role
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaborRoleManager;