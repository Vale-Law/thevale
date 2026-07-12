import { useState } from 'react';

export default function FloatingInput({ id, label, type = 'text', value, onChange, error, autoComplete, autoFocus }) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || (value && value.length > 0);

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="w-full bg-white px-4 text-sm text-[#111418] outline-none transition-colors font-body"
        style={{
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: error ? '#ef4444' : focused ? '#0a5dc2' : '#E5E2DC',
          paddingTop: isFloating ? 22 : 14,
          paddingBottom: isFloating ? 6 : 14,
          height: 52,
        }}
        placeholder=" "
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <label
        htmlFor={id}
        className="absolute left-4 pointer-events-none transition-all duration-200 font-body"
        style={{
          top: isFloating ? 8 : 17,
          fontSize: isFloating ? 10 : 14,
          color: error ? '#ef4444' : focused ? '#0a5dc2' : '#8A8578',
          textTransform: isFloating ? 'uppercase' : 'none',
          letterSpacing: isFloating ? '0.05em' : 'normal',
          fontWeight: isFloating ? 500 : 400,
        }}
      >
        {label}
      </label>
      {error && (
        <p className="text-xs text-red-500 mt-1 font-body">{error}</p>
      )}
    </div>
  );
}