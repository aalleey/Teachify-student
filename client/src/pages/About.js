import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Teachify
            </h1>
            <p className="text-xl md:text-2xl text-primary-100">
              Empowering education through technology
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Teachify aims to bridge the gap between teachers and students, creating a seamless learning experience 
            that empowers both educators and learners to achieve their full potential.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Education</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Providing access to high-quality educational resources and materials
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connected Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fostering connections between teachers and students for collaborative learning
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Leveraging modern technology to enhance the learning experience
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 dark:bg-[#0d0d0d] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What We Offer
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <h4 className="font-semibold mb-2">📚 Syllabus Management</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Easy access to course syllabi and curriculum materials
              </p>
            </Card>
            <Card>
              <h4 className="font-semibold mb-2">📝 Study Notes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive notes and study materials for all subjects
              </p>
            </Card>
            <Card>
              <h4 className="font-semibold mb-2">📄 Past Papers</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access to previous exam papers for practice and preparation
              </p>
            </Card>
            <Card>
              <h4 className="font-semibold mb-2">👥 Faculty Directory</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect with teachers and academic advisors
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Join thousands of students and teachers already using Teachify
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Create Account
          </Link>
          <Link
            to="/contact"
            className="inline-block border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

