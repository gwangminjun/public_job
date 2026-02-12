export function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-gray-400 dark:text-gray-500 py-8 mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <p className="text-sm">
            본 서비스는{' '}
            <a
              href="https://www.data.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              공공데이터포털
            </a>
            의 공공기관 채용정보 API를 활용합니다.
          </p>
          <p className="text-xs mt-2 text-gray-500 dark:text-gray-600">
            &copy; {new Date().getFullYear()} Public Job Portal. All rights reserved.
          </p>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-700">v0.3.0</p>
        </div>
      </div>
    </footer>
  );
}
