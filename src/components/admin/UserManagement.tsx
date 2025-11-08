import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldOff, Users, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogAction, setDialogAction] = useState<"grant" | "revoke">("grant");
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=list`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("فشل في جلب المستخدمين");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("حدث خطأ في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantAdmin = async (user: User) => {
    setSelectedUser(user);
    setDialogAction("grant");
    setDialogOpen(true);
  };

  const handleRevokeAdmin = async (user: User) => {
    setSelectedUser(user);
    setDialogAction("revoke");
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const action = dialogAction === "grant" ? "grant-admin" : "revoke-admin";
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: selectedUser.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشلت العملية");
      }

      toast.success(data.message);
      await fetchUsers();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "حدث خطأ في تنفيذ العملية");
    } finally {
      setActionLoading(null);
      setDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/admin-register`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("تم نسخ رابط التسجيل");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                إدارة المستخدمين
              </CardTitle>
              <CardDescription>
                عرض وإدارة صلاحيات المستخدمين المسجلين في النظام
              </CardDescription>
            </div>
            <Button
              onClick={copyRegistrationLink}
              variant="outline"
              className="w-full md:w-auto"
            >
              {copied ? (
                <>
                  <Check className="ml-2 h-4 w-4" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="ml-2 h-4 w-4" />
                  نسخ رابط التسجيل
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      لا يوجد مستخدمين مسجلين
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const isAdmin = user.roles.includes("admin");
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {isAdmin ? (
                            <Badge variant="default" className="gap-1">
                              <Shield className="h-3 w-3" />
                              مدير
                            </Badge>
                          ) : (
                            <Badge variant="secondary">مستخدم عادي</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-left">
                          {isAdmin ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRevokeAdmin(user)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <ShieldOff className="h-4 w-4 ml-2" />
                              )}
                              إزالة الصلاحيات
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleGrantAdmin(user)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                              ) : (
                                <Shield className="h-4 w-4 ml-2" />
                              )}
                              منح صلاحيات مدير
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "grant" ? "منح صلاحيات المدير" : "إزالة صلاحيات المدير"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "grant"
                ? `هل أنت متأكد من منح صلاحيات المدير للمستخدم ${selectedUser?.email}؟ سيتمكن من الوصول لجميع إعدادات لوحة التحكم.`
                : `هل أنت متأكد من إزالة صلاحيات المدير من المستخدم ${selectedUser?.email}؟ لن يتمكن من الوصول للوحة التحكم.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {dialogAction === "grant" ? "منح الصلاحيات" : "إزالة الصلاحيات"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
