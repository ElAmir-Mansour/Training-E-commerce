import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchContactInfo } from "@/lib/supabase";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactDialog = ({ open, onOpenChange }: ContactDialogProps) => {
  const { data: contactInfoList = [] } = useQuery({
    queryKey: ['contactInfo'],
    queryFn: fetchContactInfo,
  });

  const activeContacts = contactInfoList.filter((c: any) => c.is_active);

  const getIcon = (type: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      case 'telegram':
        return <Send className="w-5 h-5" />;
      default:
        return <Phone className="w-5 h-5" />;
    }
  };

  const getActionUrl = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        return `tel:${value}`;
      case 'email':
        return `mailto:${value}`;
      case 'whatsapp':
        return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
      case 'telegram':
        return `https://t.me/${value}`;
      default:
        return '#';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'phone':
        return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      case 'email':
        return 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20';
      case 'whatsapp':
        return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case 'telegram':
        return 'bg-sky-500/10 text-sky-600 hover:bg-sky-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">تواصل معنا</DialogTitle>
          <DialogDescription className="text-center">
            اختر وسيلة التواصل المناسبة لك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {activeContacts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد وسائل تواصل متاحة حالياً
            </p>
          ) : (
            activeContacts.map((contact: any) => (
              <Button
                key={contact.id}
                variant="outline"
                className={`w-full justify-start gap-3 h-auto py-4 ${getTypeColor(contact.type)}`}
                asChild
              >
                <a href={getActionUrl(contact.type, contact.value)} target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center gap-3 w-full">
                    {getIcon(contact.type)}
                    <div className="text-right flex-1">
                      <p className="font-semibold text-sm">{contact.label}</p>
                      <p className="text-xs opacity-80">{contact.value}</p>
                    </div>
                  </div>
                </a>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;