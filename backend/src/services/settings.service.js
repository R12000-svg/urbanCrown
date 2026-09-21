const { supabaseAdmin } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

const DEFAULT_SETTINGS = {
  payment_method: 'transfer',
  bank_name: '',
  account_holder: '',
  account_rut: '',
  account_type: 'Cuenta corriente',
  account_number: '',
  payment_email: '',
  payment_instructions: 'Transfiere el total de tu pedido e indica el numero de pedido en el mensaje.',
};

async function getPaymentSettings() {
  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('payment_method, bank_name, account_holder, account_rut, account_type, account_number, payment_email, payment_instructions, updated_at')
    .eq('id', 1)
    .single();
  if (error) throw new ApiError(500, 'No se pudo cargar la configuración de pagos', error.message);
  return data;
}

async function updatePaymentSettings(payload) {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...payload,
    payment_method: 'transfer',
  };
  const requiredFields = ['bank_name', 'account_holder', 'account_rut', 'account_type', 'account_number', 'payment_email'];
  if (requiredFields.some((field) => !settings[field]?.trim())) {
    throw new ApiError(400, 'Completa todos los datos de transferencia');
  }

  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .upsert([{ id: 1, ...settings }], { onConflict: 'id' })
    .select('payment_method, bank_name, account_holder, account_rut, account_type, account_number, payment_email, payment_instructions, updated_at')
    .single();
  if (error) throw new ApiError(400, 'No se pudo guardar la configuración de pagos', error.message);
  return data;
}

module.exports = { getPaymentSettings, updatePaymentSettings };
