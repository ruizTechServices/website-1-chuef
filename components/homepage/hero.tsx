export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold tracking-wide uppercase">
              Welcome to the Future of Culinary Excellence
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Chuef.com</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Your ultimate platform connecting passionate home chefs with food lovers. 
            Experience authentic, homemade cuisine delivered with love and crafted with expertise.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12 mt-16">
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Chefs</h3>
              <p className="text-gray-600">Share your culinary passion and turn your kitchen into a thriving business</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Food Lovers</h3>
              <p className="text-gray-600">Discover authentic homemade meals from talented chefs in your community</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">Every chef is verified and every meal is made with premium ingredients</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white text-gray-800 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
