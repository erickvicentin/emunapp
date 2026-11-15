import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import {
  buildInternationalPhone,
  COUNTRY_DIAL_OPTIONS,
  DEFAULT_COUNTRY,
  getDialCode,
  isPhoneTooLong,
  parsePhoneValue,
} from '../../utils/phoneUtils';

/**
 * PhoneInput Molecule
 * Combines a country dial-code dropdown (defaulting to Argentina) with a
 * digit-length-capped phone number input, emitting a standard `onChange` event
 * with `name` and formatted international `value`.
 */
export default function PhoneInput({
  id = 'register-telefono',
  name = 'telefono',
  label = 'Teléfono / WhatsApp',
  value = '',
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
}) {
  const parsedInitial = parsePhoneValue(value, DEFAULT_COUNTRY);
  const [selectedCountry, setSelectedCountry] = useState(parsedInitial.country);

  const parsedCurrent = parsePhoneValue(value, selectedCountry);
  const activeCountry = value ? parsedCurrent.country : selectedCountry;
  const nationalDigits = parsedCurrent.nationalNumber;

  const emitPhoneChange = (nextValue) => {
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const handleCountryChange = (event) => {
    const nextCountry = event.target.value;
    setSelectedCountry(nextCountry);

    if (!nationalDigits) {
      emitPhoneChange('');
      return;
    }

    let trimmedDigits = nationalDigits;
    while (trimmedDigits.length > 0 && isPhoneTooLong(trimmedDigits, nextCountry)) {
      trimmedDigits = trimmedDigits.slice(0, -1);
    }
    emitPhoneChange(buildInternationalPhone(nextCountry, trimmedDigits));
  };

  const handleNumberChange = (event) => {
    const raw = event.target.value;
    if (!raw.trim()) {
      emitPhoneChange('');
      return;
    }

    let targetCountry = activeCountry;
    let nextDigits = raw.replace(/\D/g, '');

    if (raw.trim().startsWith('+')) {
      const parsed = parsePhoneValue(raw, activeCountry);
      targetCountry = parsed.country;
      nextDigits = parsed.nationalNumber;
      if (targetCountry !== selectedCountry) {
        setSelectedCountry(targetCountry);
      }
    } else {
      const currentDial = getDialCode(activeCountry);
      if (
        nextDigits.startsWith(currentDial) &&
        nextDigits.length > currentDial.length + 6 &&
        isPhoneTooLong(nextDigits, activeCountry)
      ) {
        nextDigits = nextDigits.slice(currentDial.length);
      }
    }

    if (isPhoneTooLong(nextDigits, targetCountry)) {
      return;
    }

    emitPhoneChange(buildInternationalPhone(targetCountry, nextDigits));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="font-label-md text-[13px] text-primary flex items-center gap-1"
        >
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="sm:w-[210px] shrink-0">
          <select
            id={`${id}-country`}
            data-testid="register-phone-country-select"
            aria-label="Código de país"
            value={activeCountry}
            onChange={handleCountryChange}
            disabled={disabled}
            className={`
              w-full bg-surface-container-low focus:bg-surface-container-lowest
              text-on-surface rounded-xl px-3 py-3 text-body-md transition-all
              outline-none border shadow-2xs cursor-pointer
              ${
                error
                  ? 'border-error focus:ring-2 focus:ring-error/25'
                  : 'border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20'
              }
            `}
          >
            {COUNTRY_DIAL_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 flex items-center">
          <Icon
            name="call"
            className="absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none select-none"
          />
          <input
            id={id}
            data-testid="register-telefono-input"
            name={name}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={nationalDigits}
            onChange={handleNumberChange}
            placeholder="Ej. 91141234567"
            required={required}
            disabled={disabled}
            className={`
              w-full bg-surface-container-low focus:bg-surface-container-lowest
              text-on-surface placeholder:text-on-surface-variant/60
              rounded-xl pl-11 pr-4 py-3 text-body-md transition-all
              outline-none border shadow-2xs
              ${
                error
                  ? 'border-error focus:ring-2 focus:ring-error/25'
                  : 'border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20'
              }
            `}
          />
        </div>
      </div>

      {error && (
        <span className="text-[12px] text-error font-medium flex items-center gap-1">
          <Icon name="error" className="text-[14px]" />
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="text-[12px] text-on-surface-variant">{helperText}</span>
      )}
    </div>
  );
}
