import React from 'react';
import Icon from '../atoms/Icon';
import { PASSWORD_RULES } from '../../utils/registrationValidator';

/**
 * PasswordRequirementsChecklist Molecule
 * Displays live visual feedback for password complexity rules.
 */
export default function PasswordRequirementsChecklist({
  password = '',
  testIdPrefix = 'password-rule',
}) {
  return (
    <ul
      data-testid={`${testIdPrefix}-list`}
      className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1"
      aria-label="Requisitos de contraseña"
    >
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.id}
            data-testid={`${testIdPrefix}-${rule.id}`}
            data-valid={passed ? 'true' : 'false'}
            className={`flex items-center gap-1.5 text-body-sm transition-colors ${
              passed ? 'text-emerald-700 font-medium' : 'text-on-surface-variant'
            }`}
          >
            <Icon
              name={passed ? 'check_circle' : 'radio_button_unchecked'}
              className={`text-[16px] shrink-0 ${
                passed ? 'text-emerald-600' : 'text-outline'
              }`}
            />
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
