import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import * as ArticleModel from '@/models/ArticleModel';
import * as ReservationModel from '@/models/ReservationModel';
import type { Article } from '@/models/types';
import {
  hasErrors,
  validateReservation,
  type ReservationFormValues,
  type ValidationErrors,
} from '@/models/validation';

import { errorMessage, useFocusedQuery } from './useFocusedQuery';

const INITIAL: ReservationFormValues = { buyerName: '', buyerContact: '', message: '' };

export function useReservationController(articleId: string) {
  const db = useSQLiteContext();
  const load = useCallback(() => ArticleModel.getById(db, articleId), [db, articleId]);
  const query = useFocusedQuery<Article | null>(load, null);

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState<ValidationErrors<keyof ReservationFormValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setField = (field: keyof ReservationFormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async () => {
    const validation = validateReservation(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await ReservationModel.create(db, {
        articleId,
        buyerName: values.buyerName.trim(),
        buyerContact: values.buyerContact.trim(),
        message: values.message.trim() || null,
      });
      setSuccess(true);
    } catch (e) {
      setSubmitError(errorMessage(e, 'Die Reservation konnte nicht gesendet werden.'));
      await query.reload();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    article: query.data,
    loading: query.loading,
    loadError: query.error,
    values,
    errors,
    setField,
    submit,
    submitting,
    submitError,
    success,
    done: () => router.dismissTo('/'),
  };
}
