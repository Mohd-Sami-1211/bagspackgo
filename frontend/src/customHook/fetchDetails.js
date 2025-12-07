'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { addServiceProvider } from 'src/slices/serviceProviderSlice';
import { addProviderCompany } from 'src/slices/providerCompanySlice';
export function useFetchProvider() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/userAndProvider`, {
          withCredentials: true
        });
        console.log(res);
        
        const userData = res.data.data;
        dispatch(addServiceProvider(userData));
        console.log(userData);
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    }
    
    fetchData();
  }, [dispatch]);
}

export function useFetchCompany() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/userAndProvider`, {
          withCredentials: true
        });
        console.log(res);
        
        const provider = res.data.data;
        
        const res2 = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/getCompanyInfo?providerId=${provider?._id}`,
          { withCredentials: true }
        );
        
        const companyData = res2?.data?.data;
        dispatch(addServiceProvider(provider));
        dispatch(addProviderCompany(companyData));
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    }
    
    fetchData();
  }, [dispatch]);
}
