"use client";

import { useState, useEffect } from "react";
import api from "@/api/client/axios";
import { LecturerClassPagedResponse } from "@/types/lecturer/reference";

interface ClassStats {
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  classesToday: number;
  isLoading: boolean;
}

export function useClassStats(): ClassStats {
  const [stats, setStats] = useState<ClassStats>({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    classesToday: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all classes
        const response = await api.get<LecturerClassPagedResponse>('/lecturer/classes?size=1000');
        
        if (response.data?.items) {
          const classes = response.data.items;
          const today = new Date().toDateString();
          
          const totalClasses = classes.length;
          const activeClasses = classes.filter(cls => cls.isActive).length;
          const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
          
          // Count classes created today (simplified - in real app, you'd have createdAt date comparison)
          const classesToday = classes.filter(cls => {
            const createdDate = new Date(cls.createdAt).toDateString();
            return createdDate === today;
          }).length;

          setStats({
            totalClasses,
            activeClasses,
            totalStudents,
            classesToday,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching class stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}