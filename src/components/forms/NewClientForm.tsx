import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ClientsService } from "@/services/clientsApi";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, User, Building2, Car, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NewVehicleForm from "./NewVehicleForm";

// --- validação com Zod ---
const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  document: z.string().min(11, "Documento deve ter pelo menos 11 caracteres"),
  type: z.enum(["physical", "juridical"]),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  addVehicle: z.boolean().default(false),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface NewClientFormProps {
  onSuccess?: (client: any) => void;
  onCancel?: () => void;
}

export default function NewClientForm({
  onSuccess,
  onCancel,
}: NewClientFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      document: "",
      type: "physical",
      email: "",
      phone: "",
      address: "",
      addVehicle: false,
    },
  });

  const watchType = form.watch("type");
  const watchAddVehicle = form.watch("addVehicle");

  // Formata documento (CPF/CNPJ)
  const formatDocument = (value: string, type: "physical" | "juridical") => {
    const digits = value.replace(/\D/g, "");
    if (type === "physical") {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };


  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
  };

  const handleDocumentChange = (value: string) => {
    const type = form.getValues("type");
    const formatted = formatDocument(value, type);
    form.setValue("document", formatted);
  };

  const handleAddVehicleChange = (checked: boolean) => {
    form.setValue("addVehicle", checked);
    setShowVehicleForm(checked);
  };

  const onVehicleFormSuccess = (vehicleData?: any) => {
    if (vehicleData) {
      setVehicleData(vehicleData);
      // Auto-fill some data in the form for display purposes
      setShowVehicleForm(false);
      toast({
        title: "Veículo configurado",
        description: "Veículo será adicionado após criar o cliente.",
      });
    }
  };

  const onSubmit = async (values: ClientFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newClient = {
        name: values.name,
        document: values.document,
        type: values.type,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        active: true,
        created_by: user.id,
      };

      const client = await ClientsService.createClient(newClient);

      // If tiver veículo para adicionar, criaremos após o cliente
      if (values.addVehicle && client && vehicleData) {
        // Aqui implementaríamos a lógica para salvar o veículo associado ao cliente
        console.log("Salvando veículo para cliente", client.id, vehicleData);
      }

      toast({
        title: "Cliente criado",
        description: "Cliente criado com sucesso!",
      });

      onSuccess?.(client);
      form.reset();
      setVehicleData(null);
      setShowVehicleForm(false);
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Novo Cliente</h2>
          <p className="text-sm text-muted-foreground">
            Preencha as informações do cliente
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Cliente */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Tipo de Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="physical" id="physical" />
                          <Label htmlFor="physical">Pessoa Física</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="juridical" id="juridical" />
                          <Label htmlFor="juridical">Pessoa Jurídica</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Informações Básicas</CardTitle>
              <CardDescription>
                {watchType === "physical"
                  ? "Dados pessoais do cliente"
                  : "Dados da empresa"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === "physical" ? "Nome Completo" : "Razão Social"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          watchType === "physical"
                            ? "Ex: João Silva Santos"
                            : "Ex: Empresa LTDA"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === "physical" ? "CPF" : "CNPJ"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          watchType === "physical"
                            ? "000.000.000-00"
                            : "00.000.000/0000-00"
                        }
                        value={field.value}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                        maxLength={watchType === "physical" ? 14 : 18}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Contato</CardTitle>
              <CardDescription>Informações para comunicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" value={field.value || ""} onChange={(e) => field.onChange(formatPhone(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Rua, número, bairro, cidade - UF"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Veículo (Opcional) */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4" />
                Veículo
              </CardTitle>
              <CardDescription>
                Adicione um veículo durante o cadastro do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="addVehicle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={handleAddVehicleChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Adicionar veículo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Marque esta opção para cadastrar um veículo junto com o cliente
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {watchAddVehicle && (
                <div className="mt-4">
                  {!showVehicleForm && !vehicleData && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowVehicleForm(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Configurar Veículo
                    </Button>
                  )}

                  {showVehicleForm && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Dados do Veículo</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVehicleForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                      <NewVehicleForm
                        onSuccess={onVehicleFormSuccess}
                        simplified={true}
                      />
                    </div>
                  )}

                  {vehicleData && !showVehicleForm && (
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">
                            {vehicleData.brand} {vehicleData.model}
                          </p>
                          <p className="text-sm text-green-600">
                            {vehicleData.licensePlate} • {vehicleData.year}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVehicleForm(true)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Criando..." : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
