import { router } from 'expo-router';
import { useState } from 'react';

import { hasErrors, validateLogin, type LoginFormValues, type ValidationErrors } from '@/models/validation';

import { useAuth } from './AuthController';
import { errorMessage } from './useFocusedQuery';

export function useLoginController() {
  const auth = useAuth();
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<ValidationErrors<keyof LoginFormValues>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = (field: keyof LoginFormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async () => {
    const validation = validateLogin(values);
    setErrors(validation);
    if (hasErrors(validation)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await auth.login(values.email, values.password);
      router.replace('/seller');
    } catch (e) {
      setSubmitError(errorMessage(e, 'Anmeldung fehlgeschlagen.'));
      setValues((v) => ({ ...v, password: '' }));
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, setField, submit, submitting, submitError, cancel: () => router.back() };
}
