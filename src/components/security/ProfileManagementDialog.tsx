import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Calendar,
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileManagementDialogProps {
  trigger?: React.ReactNode;
}

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  phone: string;
  location: string;
  joinedAt: string;
  lastLogin: string;
}

export default function ProfileManagementDialog({
  trigger,
}: ProfileManagementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    bio: "",
    avatar: "",
    phone: "",
    location: "",
    joinedAt: "",
    lastLogin: "",
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(
    null,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load profile data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen]);

  // Check for changes
  useEffect(() => {
    if (originalProfile) {
      const changed =
        profile.name !== originalProfile.name ||
        profile.bio !== originalProfile.bio ||
        profile.phone !== originalProfile.phone ||
        profile.location !== originalProfile.location;
      setHasChanges(changed);
    }
  }, [profile, originalProfile]);

  const loadProfileData = () => {
    const currentUser = JSON.parse(
      localStorage.getItem("plannerfinUser") || "{}",
    );

    const profileData: UserProfile = {
      name: currentUser.name || "",
      email: currentUser.email || "",
      bio: currentUser.bio || "",
      avatar: currentUser.avatar || "",
      phone: currentUser.phone || "",
      location: currentUser.location || "",
      joinedAt: currentUser.joinedAt || new Date().toISOString(),
      lastLogin: currentUser.lastLogin || new Date().toISOString(),
    };

    setProfile(profileData);
    setOriginalProfile(profileData);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors(["Por favor, selecione apenas arquivos de imagem"]);
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(["A imagem deve ter no máximo 2MB"]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfile((prev) => ({ ...prev, avatar: result }));
        setErrors([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): string[] => {
    const validationErrors = [];

    if (!profile.name.trim()) {
      validationErrors.push("Nome é obrigatório");
    }

    if (profile.name.length < 2) {
      validationErrors.push("Nome deve ter pelo menos 2 caracteres");
    }

    if (profile.bio.length > 500) {
      validationErrors.push("Biografia deve ter no máximo 500 caracteres");
    }

    if (profile.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(profile.phone)) {
      validationErrors.push("Telefone deve estar no formato (11) 99999-9999");
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const currentUser = JSON.parse(
        localStorage.getItem("plannerfinUser") || "{}",
      );

      const updatedUser = {
        ...currentUser,
        ...profile,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("plannerfinUser", JSON.stringify(updatedUser));

      // Update user data in UserDataContext as well
      const userData = localStorage.getItem(
        `plannerfinUserData_${currentUser.id}`,
      );
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        parsedUserData.name = profile.name;
        localStorage.setItem(
          `plannerfinUserData_${currentUser.id}`,
          JSON.stringify(parsedUserData),
        );
      }

      setOriginalProfile(profile);
      setHasChanges(false);
      setIsLoading(false);
      toast.success("Perfil atualizado com sucesso!");
    }, 1500);
  };

  const resetForm = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setErrors([]);
    setHasChanges(false);
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <User className="w-4 h-4 mr-2" />
            Gerenciar Perfil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Gerenciar Perfil
          </DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e preferências
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.name || "User")}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <Camera className="w-3 h-3" />
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Clique na câmera para alterar a foto de perfil
              <br />
              Máximo 2MB - JPG, PNG ou GIF
            </p>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Informações Pessoais</h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled={true}
                  className="bg-muted"
                  placeholder="seu@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    handleInputChange(
                      "phone",
                      formatPhoneNumber(e.target.value),
                    )
                  }
                  disabled={isLoading}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  disabled={isLoading}
                  placeholder="Cidade, Estado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={isLoading}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Opcional</span>
                  <span>{profile.bio.length}/500</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Informações da Conta</h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Membro desde</Label>
                <p className="font-medium">
                  {new Date(profile.joinedAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Último acesso</Label>
                <p className="font-medium">
                  {new Date(profile.lastLogin).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
            {hasChanges && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>

          {hasChanges && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Você tem alterações não salvas</span>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
