import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit2, Check } from "lucide-react";

interface LaborRole {
  id: string;
  name: string;
  laborPercentage: number;
}

interface LaborRoleManagerProps {
  laborRoles: LaborRole[];
  onRolesChange: (roles: LaborRole[]) => void;
}

const LaborRoleManager = ({ laborRoles, onRolesChange }: LaborRoleManagerProps) => {
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePercentage, setNewRolePercentage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPercentage, setEditPercentage] = useState(0);

  const totalPercentage = laborRoles.reduce((sum, role) => sum + role.laborPercentage, 0);

  const addRole = () => {
    if (!newRoleName.trim() || newRolePercentage <= 0) return;

    const newRole: LaborRole = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      laborPercentage: newRolePercentage,
    };

    onRolesChange([...laborRoles, newRole]);
    setNewRoleName("");
    setNewRolePercentage(0);
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
    if (!editName.trim() || editPercentage <= 0) return;

    onRolesChange(
      laborRoles.map(role =>
        role.id === editingId
          ? { ...role, name: editName.trim(), laborPercentage: editPercentage }
          : role
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPercentage(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labor Roles</CardTitle>
        <CardDescription>
          Manage team roles and their percentage of the labor budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Role */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Add New Role</h4>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="role-name" className="text-xs">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g., Chef"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="role-percentage" className="text-xs">Percentage</Label>
              <Input
                id="role-percentage"
                type="number"
                placeholder="0"
                value={newRolePercentage || ""}
                onChange={(e) => setNewRolePercentage(Number(e.target.value))}
                min="0"
                max="100"
                className="h-8"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addRole}
                size="sm"
                className="h-8 w-full"
                disabled={!newRoleName.trim() || newRolePercentage <= 0}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Current Roles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Current Roles</h4>
            <Badge 
              variant={totalPercentage === 100 ? "default" : "destructive"}
              className="text-xs"
            >
              Total: {totalPercentage}%
            </Badge>
          </div>
          
          {laborRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No roles added yet. Add your first role above.
            </p>
          ) : (
            <div className="space-y-2">
              {laborRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  {editingId === role.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 flex-1"
                      />
                      <Input
                        type="number"
                        value={editPercentage || ""}
                        onChange={(e) => setEditPercentage(Number(e.target.value))}
                        min="0"
                        max="100"
                        className="h-7 w-16"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        className="h-7 w-7 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="h-7 w-7 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{role.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {role.laborPercentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(role)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRole(role.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
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
          
          {totalPercentage !== 100 && laborRoles.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {totalPercentage < 100 
                ? `Add ${100 - totalPercentage}% more to reach 100%`
                : `Reduce by ${totalPercentage - 100}% to reach 100%`
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LaborRoleManager;