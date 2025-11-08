import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Phone, Mail, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchContactInfo, addContactInfo, updateContactInfo, deleteContactInfo } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ContactInfoManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContact, setNewContact] = useState({
    type: 'phone' as 'phone' | 'email' | 'whatsapp' | 'telegram',
    value: '',
    label: '',
    is_active: true,
  });

  const { data: contactInfoList = [] } = useQuery({
    queryKey: ['contactInfo'],
    queryFn: fetchContactInfo,
  });

  const addMutation = useMutation({
    mutationFn: addContactInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
      setNewContact({ type: 'phone', value: '', label: '', is_active: true });
      toast({ title: "تم إضافة وسيلة التواصل بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateContactInfo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
      toast({ title: "تم التحديث بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  const handleAdd = () => {
    if (!newContact.value || !newContact.label) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    addMutation.mutate(newContact);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone':
      case 'whatsapp':
      case 'telegram':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'phone':
        return 'هاتف';
      case 'email':
        return 'بريد إلكتروني';
      case 'whatsapp':
        return 'واتساب';
      case 'telegram':
        return 'تيليجرام';
      default:
        return type;
    }
  };

  return (
    <Card className="p-6 border-4 border-primary/20 shadow-xl hover:shadow-2xl transition-all bg-muted/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">إدارة وسائل التواصل</h3>
          <p className="text-sm text-muted-foreground">أضف وإدارة معلومات التواصل</p>
        </div>
      </div>

      {/* Add New Contact */}
      <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold text-sm">إضافة وسيلة تواصل جديدة</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>النوع</Label>
            <Select value={newContact.type} onValueChange={(value: any) => setNewContact({ ...newContact, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">هاتف</SelectItem>
                <SelectItem value="email">بريد إلكتروني</SelectItem>
                <SelectItem value="whatsapp">واتساب</SelectItem>
                <SelectItem value="telegram">تيليجرام</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>العنوان</Label>
            <Input
              value={newContact.label}
              onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
              placeholder="مثال: الدعم الفني"
              className="bg-white"
            />
          </div>
        </div>

        <div>
          <Label>القيمة</Label>
          <Input
            value={newContact.value}
            onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
            placeholder={newContact.type === 'email' ? 'example@email.com' : '+966xxxxxxxxx'}
            className="bg-white"
          />
        </div>

        <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full">
          <Plus className="w-4 h-4 ml-2" />
          إضافة
        </Button>
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">وسائل التواصل الحالية</h4>
        {contactInfoList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">لا توجد وسائل تواصل حالياً</p>
        ) : (
          contactInfoList.map((contact: any) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getTypeIcon(contact.type)}
                <div>
                  <p className="font-medium text-sm">{contact.label}</p>
                  <p className="text-xs text-muted-foreground">{getTypeLabel(contact.type)} • {contact.value}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={contact.is_active}
                  onCheckedChange={(checked) => 
                    updateMutation.mutate({ id: contact.id, updates: { is_active: checked } })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(contact.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ContactInfoManagement;