export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold">공공기관 채용정보</h1>
        <p className="mt-2 text-blue-100 text-sm md:text-base">
          공공데이터포털 API를 활용한 실시간 채용정보 서비스
        </p>
      </div>
    </header>
  );
}
