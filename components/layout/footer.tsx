import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-6 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>© {new Date().getFullYear()}</span>
        <Link 
          href="https://ruiztechservices.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-gray-700 dark:text-gray-100 hover:underline"
        >
          ruizTechServices, LLC. 
          All rights reserved.
        </Link>
      </div>
    </footer>
  );
}
