import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import * as ArticleModel from '@/models/ArticleModel';
import { sizesFor, subcategoriesOf } from '@/models/catalog';
import { persistImage } from '@/models/ImageStorage';
import type { ArticleInput, Category, ColorKey, Condition, Department, Usage } from '@/models/types';
import {
  hasErrors,
  parsePrice,
  validateArticle,
  type ArticleFormValues,
  type ValidationErrors,
} from '@/models/validation';

import { useAuth } from './AuthController';
import { errorMessage } from './useFocusedQuery';

const EMPTY_FORM: ArticleFormValues = {
  title: '',
  brand: '',
  department: undefined,
  category: undefined,
  subcategory: undefined,
  size: undefined,
  color: undefined,
  condition: undefined,
  usage: [],
  price: '',
  description: '',
  imageUrl: null,
};

type TextField = 'title' | 'brand' | 'price' | 'description';

export function useArticleFormController(articleId?: string) {
  const db = useSQLiteContext();
  const { seller } = useAuth();
  const isEdit = !!articleId;

  const [values, setValues] = useState<ArticleFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors<keyof ArticleFormValues>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<'camera' | 'library' | null>(null);

  useEffect(() => {
    if (!articleId) return;
    ArticleModel.getById(db, articleId)
      .then((a) => {
        if (!a) {
          setSubmitError('Artikel wurde nicht gefunden.');
          return;
        }
        setValues({
          title: a.title,
          brand: a.brand ?? '',
          department: a.department,
          category: a.category,
          subcategory: a.subcategory,
          size: a.size,
          color: a.color,
          condition: a.condition,
          usage: a.usage,
          price: a.price.toFixed(2),
          description: a.description ?? '',
          imageUrl: a.imageUrl,
        });
      })
      .catch((e) => setSubmitError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [db, articleId]);

  const update = (patch: Partial<ArticleFormValues>) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch) as (keyof ArticleFormValues)[]) delete next[key];
      return next;
    });
  };

  const setText = (field: TextField, value: string) => update({ [field]: value });

  const setDepartment = (department: Department) => {
    const keepSize = values.size && sizesFor(department, values.category).includes(values.size);
    update({ department, size: keepSize ? values.size : undefined });
  };

  const setCategory = (category: Category) => {
    const keepSub = values.subcategory && subcategoriesOf(category).includes(values.subcategory);
    const sizes = sizesFor(values.department, category);
    const keepSize = values.size && sizes.includes(values.size);
    update({
      category,
      subcategory: keepSub ? values.subcategory : undefined,
      size: keepSize ? values.size : sizes.length === 1 ? sizes[0] : undefined,
    });
  };

  const pickImage = async (source: 'camera' | 'library') => {
    setPermissionDenied(null);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPermissionDenied(source);
        return;
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) update({ imageUrl: result.assets[0].uri });
    } catch (e) {
      setSubmitError(errorMessage(e, 'Das Foto konnte nicht geladen werden.'));
    }
  };

  const submit = async () => {
    if (!seller) {
      setSubmitError('Bitte zuerst als Verkäufer anmelden.');
      return;
    }
    const validation = validateArticle(values);
    setErrors(validation);
    if (hasErrors(validation)) {
      setSubmitError('Bitte prüfe die markierten Felder.');
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      const imageUrl = values.imageUrl ? await persistImage(values.imageUrl) : null;
      const input: ArticleInput = {
        title: values.title.trim(),
        brand: values.brand.trim() || null,
        department: values.department as Department,
        category: values.category as Category,
        subcategory: values.subcategory as string,
        size: values.size as string,
        color: values.color as ColorKey,
        condition: values.condition as Condition,
        usage: values.usage,
        price: parsePrice(values.price) as number,
        description: values.description.trim() || null,
        imageUrl,
      };
      if (articleId) {
        await ArticleModel.update(db, seller.id, articleId, input);
        router.back();
      } else {
        const id = await ArticleModel.create(db, seller.id, input);
        setValues(EMPTY_FORM);
        setErrors({});
        router.push({ pathname: '/article/[id]', params: { id } });
      }
    } catch (e) {
      setSubmitError(errorMessage(e, 'Der Artikel konnte nicht gespeichert werden.'));
    } finally {
      setSaving(false);
    }
  };

  return {
    isEdit,
    isSeller: !!seller,
    values,
    errors,
    loading,
    saving,
    submitError,
    permissionDenied,
    subcategories: subcategoriesOf(values.category),
    sizes: values.category ? sizesFor(values.department, values.category) : [],
    setText,
    setDepartment,
    setCategory,
    setSubcategory: (subcategory: string) => update({ subcategory }),
    setSize: (size: string) => update({ size }),
    setColor: (color: ColorKey) => update({ color }),
    setCondition: (condition: Condition) => update({ condition }),
    toggleUsage: (usage: Usage) =>
      update({
        usage: values.usage.includes(usage)
          ? values.usage.filter((u) => u !== usage)
          : [...values.usage, usage],
      }),
    pickImage,
    removeImage: () => update({ imageUrl: null }),
    openSettings: () => Linking.openSettings(),
    submit,
    login: () => router.push('/login'),
  };
}
