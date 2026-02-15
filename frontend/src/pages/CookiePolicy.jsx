import usePageTitle from '../hooks/usePageTitle'

export default function CookiePolicy() {
  usePageTitle('Polityka cookies')

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Polityka plików cookies</h1>

      <section>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Niniejsza strona korzysta z plików cookies w celu zapewnienia działania serwisu oraz zapamiętania Twoich wyborów.
        </p>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-2">Jakie pliki cookies używamy?</h2>
        <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-1 mb-4">
          <li>
            <strong>Niezbędne</strong> – token logowania (JWT) oraz dane użytkownika w pamięci przeglądarki (localStorage), 
            umożliwiające utrzymanie sesji po zalogowaniu. Bez nich nie można korzystać z konta.
          </li>
          <li>
            <strong>Preferencje</strong> – zapis wyboru motywu (jasny/ciemny) oraz Twojej zgody na cookies (localStorage).
          </li>
          <li>
            <strong>Zewnętrzne</strong> – Google reCAPTCHA (na stronie logowania i rejestracji) w celu ochrony przed spamem i botami. 
            Obowiązuje <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">Polityka prywatności Google</a>.
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-2">Jak zarządzać cookies?</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Możesz w każdej chwili usunąć dane zapisane w przeglądarce (localStorage) przez ustawienia przeglądarki lub wyczyścić dane witryny. 
          Wylogowanie usuwa token sesji. Wyłączenie lub usunięcie plików niezbędnych do logowania uniemożliwi korzystanie z konta.
        </p>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-2">Podstawa prawna</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Przetwarzanie w celach niezbędnych do świadczenia usługi oraz zapamiętania zgody odbywa się na podstawie art. 6 ust. 1 lit. b i f RODO 
          oraz – w zakresie zgody – lit. a RODO. Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, 
          przenoszenia danych oraz wniesienia skargi do organu nadzorczego.
        </p>

        <p className="text-slate-500 dark:text-slate-400 text-sm mt-8">
          Ostatnia aktualizacja: luty 2025. W razie pytań skontaktuj się z administratorem serwisu.
        </p>
      </section>
    </div>
  )
}
