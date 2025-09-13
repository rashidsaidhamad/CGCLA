import React, { useState, useEffect } from 'react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel slides data
  const slides = [
    {
      id: 1,
      title: "Welcome to CGCLA",
      subtitle: "Chief Government Chemist Laboratory Agency",
      description: "Advanced warehouse management for laboratory supplies and chemical inventory",
      backgroundColor: "from-blue-600 to-green-600"
    },
    {
      id: 2,
      title: "Laboratory Excellence",
      subtitle: "Quality Chemical Analysis",
      description: "Ensuring the highest standards in chemical testing and laboratory services",
      backgroundColor: "from-green-600 to-yellow-500"
    },
    
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Make API call to Django backend
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store tokens in localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Get user profile
        const profileResponse = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${data.access}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          
          // Call onLogin with user data including role information
          if (onLogin) {
            onLogin({
              ...credentials,
              user: userData,
              tokens: {
                access: data.access,
                refresh: data.refresh,
              }
            });
          }
        } else {
          setError('Failed to fetch user profile.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please check your connection and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = credentials.username.trim() && credentials.password.trim();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4 px-2">
      {/* Main Rectangle Container */}
      <div className="max-w-7xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex min-h-[800px]">
          
          {/* Left Div - Carousel/Banner Section */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative h-full flex items-center justify-center p-12">
                  {/* Background Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center text-white max-w-lg">
                    <div className="mb-8">
                      <img
                        src="/cgcla.jpg"
                        alt="CGCLA Logo"
                        className="h-24 w-auto mx-auto mb-6 rounded-full shadow-2xl bg-white p-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    <h1 className="text-4xl font-bold mb-4 animate-fade-in" style={{fontFamily: 'Poppins, Roboto, sans-serif'}}>
                      {slide.title}
                    </h1>
                    <h2 className="text-xl font-semibold mb-6 text-yellow-200">
                      {slide.subtitle}
                    </h2>
                    <p className="text-lg leading-relaxed text-blue-50">
                      {slide.description}
                    </p>

                    {/* Feature Icons */}
            
                  </div>
                </div>
              </div>
            ))}

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Div - Login Form Section */}
          <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16 bg-white">
            <div className="mx-auto w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-10">
                <img
                  src="/cgcla.jpg"
                  alt="Chief Government Chemist Laboratory Agency Logo"
                  className="h-20 w-auto mx-auto mb-6"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Poppins, Roboto, sans-serif'}}>
                  CGCLA Warehouse Management
                </h2>
                <p className="text-gray-600">
                  Sign in to access the warehouse system
                </p>
              </div>

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Username Field */}
                <div className="mb-8">
                  <label htmlFor="username" className="block text-lg font-semibold text-gray-700 mb-4">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="username"
                      autoComplete="username"
                      required
                      value={credentials.username}
                      onChange={handleInputChange}
                      className="block w-full pl-16 pr-6 py-5 text-xl border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm"
                      placeholder="Enter your username"
                      aria-label="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-8">
                  <label htmlFor="password" className="block text-lg font-semibold text-gray-700 mb-4">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={credentials.password}
                      onChange={handleInputChange}
                      className="block w-full pl-16 pr-16 py-5 text-xl border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm"
                      placeholder="Enter your password"
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L7.05 7.05M9.878 9.878a3 3 0 013-3m7.072 2.072L19.95 7.05m-2.5 2.5L7.05 7.05m12.9 12.9L7.05 7.05" />
                        </svg>
                      ) : (
                        <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white transition duration-200 ${
                      isFormValid && !isLoading
                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      'LOGIN'
                    )}
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-8">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Need help? Contact{' '}
                    <a href="mailto:support@cgcla.go.tz" className="font-medium text-blue-600 hover:text-blue-500">
                      IT Support
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
