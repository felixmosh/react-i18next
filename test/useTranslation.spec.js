import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import i18nInstance from './i18n';
import { useTranslation } from '../src/useTranslation';
import { setI18n } from '../src/context';
import { I18nextProvider } from '../src/I18nextProvider';

jest.unmock('../src/useTranslation');
jest.unmock('../src/I18nextProvider');

describe('useTranslation', () => {
  describe('object', () => {
    it('should render correct content', () => {
      const { result } = renderHook(() => useTranslation('translation', { i18n: i18nInstance }));
      const { t, i18n } = result.current;
      expect(t('key1')).toBe('test');
      expect(i18nInstance).toBe(i18n);
    });
  });

  describe('array', () => {
    it('should render correct content', () => {
      const { result } = renderHook(() => useTranslation('translation', { i18n: i18nInstance }));
      const [t, i18n] = result.current;
      expect(t('key1')).toBe('test');
      expect(i18n).toBe(i18nInstance);
    });
  });

  describe('without i18next instance', () => {
    beforeAll(() => {
      setI18n(undefined);
    });

    afterAll(() => {
      setI18n(i18nInstance);
    });

    describe('handling gracefully', () => {
      it('should render content fallback', () => {
        console.warn = jest.fn();

        const { result } = renderHook(() => useTranslation('translation', { i18n: undefined }));
        const { t, i18n } = result.current;

        expect(t('key1')).toBe('key1');
        expect(t(['doh', 'Human friendly fallback'])).toBe('Human friendly fallback');
        expect(i18n).toEqual({});

        expect(console.warn).toHaveBeenCalled();
      });
    });
  });

  describe('few namespaces', () => {
    it('hook destructured values are expected types', () => {
      const { result } = renderHook(() =>
        useTranslation(['other', 'translation'], { i18n: i18nInstance }),
      );
      const { t, i18n } = result.current;
      expect(typeof t).toBe('function');
      expect(i18n).toEqual(i18nInstance);
      expect(<div>{t('key1')}</div>).toEqual(<div>key1</div>);
    });

    describe('fallback mode', () => {
      beforeAll(() => {
        i18nInstance.options.react.nsMode = 'fallback';
      });

      afterAll(() => {
        delete i18nInstance.options.react.nsMode;
      });

      it('should render correct content', () => {
        const { result } = renderHook(() =>
          useTranslation(['other', 'translation'], { i18n: i18nInstance }),
        );
        const { t } = result.current;

        expect(t('key1')).toBe('test');
      });
    });

    it('should render content fallback', () => {
      const { result } = renderHook(() =>
        useTranslation(['other', 'translation'], { i18n: i18nInstance }),
      );
      const { t } = result.current;

      expect(t('key1')).toBe('key1');
    });
  });

  describe('default namespace from context', () => {
    afterEach(() => {
      i18nInstance.reportNamespaces.usedNamespaces = {};
    });

    const namespace = 'sampleNS';
    const wrapper = ({ children }) => (
      <I18nextProvider defaultNS={namespace} i18={i18nInstance}>
        {children}
      </I18nextProvider>
    );

    it('should render content fallback', () => {
      const { result } = renderHook(() => useTranslation(), { wrapper });
      const { t } = result.current;

      expect(t('key1')).toBe('key1');

      expect(i18nInstance.reportNamespaces.getUsedNamespaces()).toContain(namespace);
    });
  });
});
