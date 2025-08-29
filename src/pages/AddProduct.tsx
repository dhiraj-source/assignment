import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { categoriesAtom, productsAtom } from "@/lib/store";
import { indexedDBService } from "@/lib/indexeddb";
import {
  basicInfoSchema,
  variantOptionSchema,
  combinationSchema,
  pricingInventorySchema,
  BasicInfoForm,
} from "@/lib/validations";
import { Combination as CombinationType, Discount, Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductsHeader from "@/components/ProductsHeader";
import { z } from "zod";
import { TagInput } from "@/components/TagInput";

// ---------- Local helper schemas/types  ----------
const variantsStepSchema = z.object({
  variants: z
    .array(variantOptionSchema)
    .min(1, "At least one variant option is required"),
});
type VariantsStepForm = z.infer<typeof variantsStepSchema>;

const combinationsStepSchema = z.object({
  combinations: z
    .array(combinationSchema)
    .min(1, "Add at least one combination"),
});
type CombinationsStepForm = z.infer<typeof combinationsStepSchema>;

// pricingInventorySchema
type PriceInfoForm = z.infer<typeof pricingInventorySchema>;

// ---------- UI step labels ----------
const STEPS = [
  { id: 1, title: "Description" },
  { id: 2, title: "Variants" },
  { id: 3, title: "Combinations" },
  { id: 4, title: "Price Info" },
];
const breadcrumbSteps = [
  "Description",
  "Variants",
  "Combinations",
  "Price info",
];

// Draft record shape for IndexedDB
type DraftRecord = {
  id: string;
  step: number;
  data: Partial<
    BasicInfoForm & VariantsStepForm & CombinationsStepForm & PriceInfoForm
  >;
  createdAt: Date;
  updatedAt: Date;
};

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories] = useAtom(categoriesAtom);
  const [products, setProducts] = useAtom(productsAtom);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<
    Partial<
      BasicInfoForm & VariantsStepForm & CombinationsStepForm & PriceInfoForm
    >
  >({});
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const { toast } = useToast();

  // ---------- Loading latest draft ----------
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const drafts = await indexedDBService.getAllDrafts();
        if (drafts.length > 0) {
          const latest = drafts.sort(
            (a: DraftRecord, b: DraftRecord) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0] as DraftRecord;

          const shouldResume = window.confirm(
            "You have an unsaved draft. Would you like to resume where you left off?"
          );
          if (shouldResume) {
            setCurrentDraftId(latest.id || null);
            setCurrentStep(latest.step);
            setFormData(latest.data);
          }
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    };
    loadDraft();
  }, []);

  // ----------  Description step ----------
  const basicInfoForm = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: formData.name || "",
      brand: formData.brand || "",
      category: formData.category || "",
      image: formData.image || "",
    },
    values: {
      name: formData.name || "",
      brand: formData.brand || "",
      category: formData.category || "",
      image: formData.image || "",
    },
  });

  // ---------- Variants step ----------
  const variantsForm = useForm<VariantsStepForm>({
    resolver: zodResolver(variantsStepSchema),
    defaultValues: {
      variants:
        formData.variants && formData.variants.length
          ? formData.variants
          : [{ name: "Size", values: ["M", "L"] }],
    },
    values: {
      variants:
        formData.variants && formData.variants.length
          ? formData.variants
          : [{ name: "Size", values: ["M", "L"] }],
    },
  });

  // helpers for varients
  const addVariant = () => {
    const current = variantsForm.getValues("variants") || [];
    variantsForm.setValue("variants", [...current, { name: "", values: [] }], {
      shouldValidate: true,
    });
  };
  const removeVariant = (idx: number) => {
    const current = variantsForm.getValues("variants") || [];
    variantsForm.setValue(
      "variants",
      current.filter((_, i) => i !== idx),
      { shouldValidate: true }
    );
  };
  // IN COMBINATION SECTION IF THE INSTOCK IS FALSE THEN SET VALUE TO NULL


  // ---------- Combinations step ----------
  const combinationsForm = useForm<CombinationsStepForm>({
    resolver: zodResolver(combinationsStepSchema),
    defaultValues: {
      combinations: formData.combinations || [],
    },
    values: {
      combinations: formData.combinations || [],
    },
  });

  // Generating combinations from variants
  const generatedCombinations = useMemo(() => {
    const variants = variantsForm.watch("variants") || [];

    const generateCombinations = (
      arr: { name: string; values: string[] }[]
    ) => {
      if (!arr.length) return [];
      return arr.reduce(
        (acc, variant) =>
          acc.flatMap((comb) =>
            variant.values.map((val) => [
              ...comb,
              { option: variant.name, value: val },
            ])
          ),
        [[]] as { option: string; value: string }[][]
      );
    };

    return generateCombinations(variants);
  }, [variantsForm.watch("variants")]);

  // initiating the combinations when variants change
  useEffect(() => {
    if (generatedCombinations.length > 0 && currentStep === 3) {
      const currentCombinations =
        combinationsForm.getValues("combinations") || {};

      if (
        Object.keys(currentCombinations).length !== generatedCombinations.length
      ) {
        const newCombinations = generatedCombinations.map((combo, index) => {
          const existing = currentCombinations[index] || {};
          console.log("exssiting====================>>>>>", existing);
          return {
            name: combo.map((c) => c.value).join("/"),
            sku: existing.sku || "",
            quantity: existing.quantity || 0,
            inStock: existing.inStock !== undefined ? existing.inStock : true,
          };
        });

        combinationsForm.setValue("combinations", newCombinations, {
          shouldValidate: true,
        });
        console.log("Initialized combinations:", newCombinations);
      }
    }
  }, [generatedCombinations.length, currentStep]);

  // ----------  Price Info Step----------
  const priceForm = useForm<PriceInfoForm>({
    resolver: zodResolver(pricingInventorySchema),
    defaultValues: {
      priceInr: isNaN(formData.priceInr) ? 0 : formData.priceInr,

      discount: formData.discount || null,
    },
    values: {
      priceInr: formData.priceInr || 0,

      discount: formData.discount || null,
    },
  });

  // ---------- Draft save helper ----------
  const saveDraft = async (
    stepData: Partial<
      BasicInfoForm & VariantsStepForm & CombinationsStepForm & PriceInfoForm
    >,
    step: number
  ) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    const draft: DraftRecord = {
      id: currentDraftId || `draft_${Date.now()}`,
      step,
      data: updatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await indexedDBService.saveDraft(draft as any);
      setCurrentDraftId(draft.id || null);
      toast({
        title: "Draft saved",
        description: "Your progress has been saved.",
      });
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  // Next button handler function for saving data to draft at each step
  const handleNext = async (
    stepData: Partial<
      BasicInfoForm & VariantsStepForm & CombinationsStepForm & PriceInfoForm
    >
  ) => {
    console.log("handleNext called with step:", currentStep, "data:", stepData);
    await saveDraft(stepData, currentStep + 1);
    setCurrentStep((prev) => prev + 1);
  };

  // ---------- Save the Product----------
  const handleComplete = async (priceData: PriceInfoForm) => {
    console.log("handleComplete called with priceData:", priceData);
    const data = { ...formData, ...priceData };
    console.log("Complete form data:", data);

    // map combinations array -> object keys: c1, c2, ...
    const combinationsArr = (data.combinations || []) as CombinationType[];
    const combinationsObj = combinationsArr.reduce((acc, combo, idx) => {
      const key = `c${idx + 1}`;
      acc[key] = combo;
      return acc;
    }, {} as Record<string, CombinationType>);

    const priceInr = data.priceInr || 0;

    const discount: Discount | undefined = data.discount
      ? {
        method: data.discount.method,
        value: data.discount.value,
      }
      : { method: "pct", value: 0 };

    const newProduct: Product = {
      id: `product_${Date.now()}`,
      name: data.name!,
      category: data.category!,
      brand: data.brand!,
      image: data.image!,
      variants: (data.variants || []) as { name: string; values: string[] }[],
      combinations: combinationsObj,
      priceInr,
      discount: discount!,
    };

    console.log("beforee the submission==============>>>", newProduct);
    try {
      setProducts([...products, newProduct]);

      if (currentDraftId) {
        await indexedDBService.deleteDraft(currentDraftId);
      }

      toast({ title: "Success!", description: "Product has been added." });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  // handle save Draft
  const handleSaveDraft = async () => {
    let currentData: any = {};
    if (currentStep === 1) currentData = basicInfoForm.getValues();
    else if (currentStep === 2) currentData = variantsForm.getValues();
    else if (currentStep === 3) currentData = combinationsForm.getValues();
    else currentData = priceForm.getValues();

    await saveDraft(currentData, currentStep);
    navigate("/");
  };

  //
  const handleNextBtn = () => {
    console.log("handleNextBtn called for step:", currentStep);

    if (currentStep === 1) {
      console.log("Submitting step 1");
      basicInfoForm.handleSubmit(
        (data) => {
          console.log("Step 1 data validated:", data);
          handleNext(data);
        },
        (errors) => {
          console.log("Step 1 validation errors:", errors);
        }
      )();
    } else if (currentStep === 2) {
      console.log("Submitting step 2");
      variantsForm.handleSubmit(
        (data) => {
          console.log("Step 2 data validated:", data);
          handleNext(data);
        },
        (errors) => {
          console.log("Step 2 validation errors:", errors);
        }
      )();
    } else if (currentStep === 3) {
      console.log("Submitting step 3");
      console.log("Current combinations data:", combinationsForm.getValues());

      combinationsForm.handleSubmit(
        (data) => {
          console.log("Step 3 data validated:", data);
          handleNext(data);
        },
        (errors) => {
          console.log("Step 3 validation errors:", errors);
          // Check for specific combination errors
          if (errors.combinations) {
            console.log("Combination errors details:", errors.combinations);
            toast({
              title: "Validation Error",
              description:
                "Please fix all combination errors before proceeding",
              variant: "destructive",
            });
          }
        }
      )();
    } else {
      console.log("Submitting final step");
      priceForm.handleSubmit(
        (data) => {
          console.log("Final step data validated:", data);
          handleComplete(data);
        },
        (errors) => {
          console.log("Final step validation errors:", errors);
        }
      )();
    }
  };

  return (
    <Layout>
      <ProductsHeader
        heading="Add Product"
        buttonContent={{
          first: "Cancel",
          second: currentStep < STEPS.length ? "Next" : "Save Product",
        }}
        firstBtn={handleSaveDraft}
        secondBtn={handleNextBtn}
      />

      <div className="max-w-xl">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            {breadcrumbSteps.map((step, index) => (
              <React.Fragment key={step}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    className={
                      currentStep > index + 1
                        ? "text-blue-600 bg-[#DAEDF9] font-medium px-4 py-1 rounded-lg"
                        : currentStep === index + 1
                          ? "bg-[#DAEDF9] font-medium px-4 py-1 rounded-lg text-blue-500"
                          : "text-gray-500"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentStep > index + 1) setCurrentStep(index + 1);
                    }}
                  >
                    {step}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumbSteps.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardContent className="p-6 space-y-8">
            {/* Description */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Description</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-normal">
                      Product name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      {...basicInfoForm.register("name")}
                      className={
                        basicInfoForm.formState.errors.name
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {basicInfoForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {basicInfoForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-normal">
                      Category *
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        basicInfoForm.setValue("category", value, {
                          shouldValidate: true,
                        })
                      }
                      value={basicInfoForm.watch("category")}
                    >
                      <SelectTrigger
                        className={
                          basicInfoForm.formState.errors.category
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {basicInfoForm.formState.errors.category && (
                      <p className="text-sm text-destructive">
                        {basicInfoForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand" className="font-normal">
                      Brand *
                    </Label>
                    <Input
                      id="brand"
                      placeholder="Enter product brand"
                      {...basicInfoForm.register("brand")}
                      className={
                        basicInfoForm.formState.errors.brand
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {basicInfoForm.formState.errors.brand && (
                      <p className="text-sm text-destructive">
                        {basicInfoForm.formState.errors.brand.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Input
                        id="image"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              basicInfoForm.setValue(
                                "image",
                                (event.target?.result as string) || "",
                                {
                                  shouldValidate: true,
                                }
                              );
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="image"
                        className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded-md cursor-pointer hover:bg-blue-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </label>
                    </div>
                    {basicInfoForm.formState.errors.image && (
                      <p className="text-sm text-destructive">
                        {basicInfoForm.formState.errors.image.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Variants */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Variants</h2>

                <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-4">
                  <Label>Option *</Label>
                  <Label>Values *</Label>
                  <span></span>
                </div>

                <div className="space-y-4">
                  {(variantsForm.watch("variants") || []).map((v, vIdx) => (
                    <>
                      <div
                        key={vIdx}
                        className="grid grid-cols-[1fr_2fr_auto] gap-4 items-center p-4"
                      >
                        <Input
                          placeholder="e.g. Size, Color"
                          value={
                            variantsForm.watch(`variants.${vIdx}.name`) || ""
                          }
                          onChange={(e) =>
                            variantsForm.setValue(
                              `variants.${vIdx}.name`,
                              e.target.value,
                              {
                                shouldValidate: true,
                              }
                            )
                          }
                          className={
                            variantsForm.formState.errors.variants?.[vIdx]?.name
                              ? "border-destructive"
                              : ""
                          }
                        />

                        <TagInput
                          value={
                            variantsForm.watch(`variants.${vIdx}.values`) || []
                          }
                          onChange={(newValues: any) =>
                            variantsForm.setValue(
                              `variants.${vIdx}.values`,
                              newValues,
                              { shouldValidate: true }
                            )
                          }
                          placeholder={
                            v.name?.toLowerCase() === "size"
                              ? "e.g. M"
                              : "e.g. Black"
                          }
                          className={
                            variantsForm.formState.errors.variants?.[vIdx]
                              ?.values
                              ? "border-destructive"
                              : ""
                          }
                        />

                        <button
                          type="button"
                          onClick={() => removeVariant(vIdx)}
                          className="text-destructive hover:text-red-600"
                        >
                          <img src="/images/icons/trash.png" className="w-4" />
                        </button>
                      </div>
                      <div>
                        {variantsForm.formState.errors.variants?.[vIdx]
                          ?.name && (
                            <p className="text-sm text-destructive pl-4 -mt-4">
                              {`${variantsForm.formState.errors.variants?.[vIdx]?.name?.message} And ${variantsForm.formState.errors.variants?.[vIdx]?.values?.message}`}
                            </p>
                          )}
                      </div>
                    </>
                  ))}

                  <Button
                    type="button"
                    onClick={addVariant}
                    className="bg-white text-blue-500"
                  >
                    <span className="text-2xl -mt-1">+</span>Add Option
                  </Button>

                  {variantsForm.formState.errors.variants && (
                    <p className="text-sm text-destructive">
                      {(variantsForm.formState.errors.variants as any)?.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Combinations</h2>
                {/* <p className="text-sm text-muted-foreground">
    Please fill in SKU and quantity for each combination
  </p> */}

                {generatedCombinations.length > 0 ? (
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="grid md:grid-cols-6 gap-4 px-4">
                      <Label className="col-span-1"></Label>
                      <Label className="col-span-2">SKU *</Label>
                      <Label className="col-span-1">In Stock</Label>
                      <Label className="col-span-2">Quantity *</Label>
                    </div>

                    {generatedCombinations.map((combo, cIdx) => {
                      const name = combo.map((c) => c.value).join("/");
                      const currentSku = combinationsForm.watch(`combinations.${cIdx}.sku`) || "";

                      // Check for duplicate SKUs
                      const allSkus = generatedCombinations.map((_, idx) =>
                        combinationsForm.watch(`combinations.${idx}.sku`) || ""
                      );
                      const isDuplicate =
                        currentSku &&
                        allSkus.filter((sku) => sku === currentSku).length > 1;

                      return (
                        <div
                          key={cIdx}
                          className="p-4 grid md:grid-cols-6 gap-4 items-start"
                        >
                          {/* Combination name (read-only) */}
                          <div className="col-span-1">
                            <Input
                              value={name}
                              disabled
                              className="bg-white border-0 shadow-none cursor-default text-black disabled:opacity-100 disabled:text-black"
                            />
                            <input
                              type="hidden"
                              {...combinationsForm.register(`combinations.${cIdx}.name`)}
                              value={name}
                            />
                          </div>

                          {/* SKU */}
                          <div className="col-span-2">
                            <Input
                              placeholder="e.g. ABC12"
                              {...combinationsForm.register(`combinations.${cIdx}.sku`, {
                                required: true,
                              })}
                              className={
                                isDuplicate ||
                                  combinationsForm.formState.errors.combinations?.[cIdx]?.sku
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                            {isDuplicate && (
                              <p className="text-sm text-destructive">Duplicate SKU</p>
                            )}
                            {combinationsForm.formState.errors.combinations?.[cIdx]?.sku && (
                              <p className="text-sm text-destructive">
                                {
                                  combinationsForm.formState.errors.combinations?.[cIdx]?.sku
                                    ?.message
                                }
                              </p>
                            )}
                          </div>

                          {/* In Stock */}
                          <div className="col-span-1">
                            <div className="">
                              <Switch
                                checked={!!combinationsForm.watch(`combinations.${cIdx}.inStock`)}
                                onCheckedChange={(val) => {
                                  combinationsForm.setValue(`combinations.${cIdx}.inStock`, val, {
                                    shouldValidate: true,
                                  });
                                  if (!val) {
                                    combinationsForm.setValue(`combinations.${cIdx}.quantity`, null, {
                                      shouldValidate: true,
                                    });
                                  }
                                }}
                              />

                            </div>
                          </div>

                          {/* Quantity */}
                          {/* Quantity */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="0"
                              disabled={!combinationsForm.watch(`combinations.${cIdx}.inStock`)}
                              value={
                                combinationsForm.watch(`combinations.${cIdx}.inStock`)
                                  ? combinationsForm.watch(`combinations.${cIdx}.quantity`) ?? ""
                                  : ""
                              }
                              onChange={(e) =>
                                combinationsForm.setValue(
                                  `combinations.${cIdx}.quantity`,
                                  e.target.value === "" ? null : Number(e.target.value),
                                  { shouldValidate: true }
                                )
                              }
                              className={
                                combinationsForm.formState.errors.combinations?.[cIdx]?.quantity
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                            {combinationsForm.formState.errors.combinations?.[cIdx]?.quantity && (
                              <p className="text-sm text-destructive">
                                {combinationsForm.formState.errors.combinations?.[cIdx]?.quantity?.message}
                              </p>
                            )}
                          </div>


                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No combinations generated. Please set up variants first.
                  </p>
                )}
              </div>

            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Price Info</h2>

                <div className="grid md:grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priceInr" className="font-semibold">
                      Price
                    </Label>
                    <Input
                      id="priceInr"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={0}
                      {...priceForm.register("priceInr", {
                        valueAsNumber: true,
                      })}
                      className={
                        priceForm.formState.errors.priceInr
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {priceForm.formState.errors.priceInr && (
                      <p className="text-sm text-destructive">
                        {priceForm.formState.errors.priceInr.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="font-semibold">Discount</Label>
                  <div className="grid grid-cols-[1fr,auto] gap-3 items-center">
                    {/* Discount value input */}
                    <Input
                      type="number"
                      step="0.01"
                      value={priceForm.watch("discount")?.value ?? ""}
                      onChange={(e) => {
                        const currentDiscount = priceForm.getValues("discount");
                        priceForm.setValue(
                          "discount",
                          {
                            method: currentDiscount?.method || "pct",
                            value: Number(e.target.value) || 0,
                          },
                          { shouldValidate: true }
                        );
                      }}
                      placeholder="0"
                    />
                    <div className="flex rounded-md border bg-muted text-sm font-medium">
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-l-md ${priceForm.watch("discount")?.method === "pct"
                          ? "bg-primary text-white"
                          : "text-muted-foreground"
                          }`}
                        onClick={() => {
                          const currentDiscount =
                            priceForm.getValues("discount");
                          priceForm.setValue(
                            "discount",
                            {
                              method: "pct" as const,
                              value: currentDiscount?.value || 0,
                            },
                            { shouldValidate: true }
                          );
                        }}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-r-md ${priceForm.watch("discount")?.method === "flat"
                          ? "bg-primary text-white"
                          : "text-muted-foreground"
                          }`}
                        onClick={() => {
                          const currentDiscount =
                            priceForm.getValues("discount");
                          priceForm.setValue(
                            "discount",
                            {
                              method: "flat" as const,
                              value: currentDiscount?.value || 0,
                            },
                            { shouldValidate: true }
                          );
                        }}
                      >
                        Flat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
