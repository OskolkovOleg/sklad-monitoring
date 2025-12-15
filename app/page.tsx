import Image from 'next/image'
import Link from 'next/link'
import { 
  Trophy, 
  Building2, 
  ShoppingBag, 
  Globe, 
  Star, 
  Headphones 
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen font-sans flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-black text-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">АС ВСКЗ</span>
          <span className="text-xs text-gray-400 mt-1">by OskolkovOleg</span>
        </div>
        <Link 
          href="/auth/login"
          className="bg-[#00D632] hover:bg-[#00b32a] text-black font-bold py-2 px-6 rounded-full transition-colors text-sm md:text-base"
        >
          Войти
        </Link>
      </header>

      {/* Hero Section */}
      <section className="bg-black text-white py-16 md:py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
              Лучшая АС для<br />
              складов и<br />
              логистики
            </h1>
            <p className="text-lg md:text-md text-gray-300 max-w-lg leading-relaxed">
              Экономьте время, минимизируйте ошибки и улучшайте клиентский опыт с нашей автоматизированной системой визуализации складских запасов.
            </p>
            <div className="pt-4">
              <Link 
                href="/auth/login"
                className="inline-block bg-[#00D632] hover:bg-[#00b32a] text-black font-bold text-lg px-8 py-4 rounded-full transition-transform hover:-translate-y-1"
              >
                Войти
              </Link>
            </div>
            
            {/* Social Proof / Ratings */}
            {/* <div className="pt-12 flex flex-wrap gap-8 items-center text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">TrustRadius</span>
                <div className="flex text-white">★★★★★</div>
                <span className="text-xs">9.2/10</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">Capterra</span>
                <div className="flex text-white">★★★★☆</div>
                <span className="text-xs">4.4/5</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">G2</span>
                <div className="flex text-white">★★★★★</div>
                <span className="text-xs">4.5/5</span>
              </div> */}
            {/* </div> */}
          </div>

          <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden bg-gray-900">
            {/* Using the image.png as requested */}
            <Image
              src="/image.png"
              alt="Warehouse worker"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-black">
            АС ВСКЗ в деталях
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <Trophy className="w-12 h-12 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Передовые технологии</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ведущие технологии, подкрепленные 97% успешных внедрений и высокой производительностью.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <Building2 className="w-12 h-12 text-[#00D632]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Надежная архитектура</h3>
                <p className="text-gray-600 leading-relaxed">
                  Мы построены на надежном фундаменте, что позволяет нам инвестировать в развитие продукта.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <ShoppingBag className="w-12 h-12 text-[#00D632]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Интеграция с ERP</h3>
                <p className="text-gray-600 leading-relaxed">
                  Мы гордимся тем, что являемся надежным партнером в интеграции с глобальными ERP системами.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <Globe className="w-12 h-12 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Проверенная эффективность</h3>
                <p className="text-gray-600 leading-relaxed">
                  Мы обрабатываем миллионы операций в месяц для крупнейших брендов и складов.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <Star className="w-12 h-12 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Отличные отзывы</h3>
                <p className="text-gray-600 leading-relaxed">
                  Мы заслужили отличные отзывы от клиентов, включая высокую оценку удобства интерфейса.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <Headphones className="w-12 h-12 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Поддержка экспертов</h3>
                <p className="text-gray-600 leading-relaxed">
                  Наши эксперты всегда готовы помочь с обучением и технической поддержкой системы.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="bg-black text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-black">
            Есть вопросы?
          </h2>
          <p className="text-xl text-gray-300">
            У нашей команды экспертов есть ответы. Заполните свои данные для живой демонстрации.
          </p>
          <div className="pt-4">
            <Link 
              href="/dashboard"
              className="inline-block bg-[#00D632] hover:bg-[#00b32a] text-black font-bold text-lg px-10 py-4 rounded-full transition-transform hover:-translate-y-1"
            >
              Заказать демо
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="bg-black text-white py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">АС ВСКЗ</span>
            <span className="text-xs text-gray-500">by OskolkovOleg</span>
          </div>
          
          <div className="flex gap-8 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Политика конфиденциальности</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Условия использования</Link>
            <Link href="#" className="hover:text-white transition-colors">Безопасность</Link>
          </div>

          <div className="text-sm text-gray-500">
            © АС ВСКЗ Copyright 2025 Все права защищены
          </div>
        </div>
      </footer>
    </div>
  )
}

