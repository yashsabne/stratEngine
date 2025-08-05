import React from 'react';
import { Link } from 'react-router-dom';

const BusinessTypeFilter = ({ selectedType, onChange }) => {
  const businessTypes = [
    { value: 'All_Types', label: 'All Types' },
    { value: 'startup', label: 'Startup' },
    { value: 'saas', label: 'SaaS' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'technology', label: 'Technology' }
  ];

  return (
    <div>
    
      <select
        value={selectedType}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {businessTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
          <Link
                  to='/admin-blog'
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-md transition-all duration-300 mx-4"
                >
                  Post Blog
                </Link>
    </div>
  );
};

export default BusinessTypeFilter;