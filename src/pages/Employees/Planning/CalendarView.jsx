// src/pages/Employees/Planning/CalendarView.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, MoreVertical, Clock, User } from 'lucide-react';
import { getShiftTypeColor, getShiftTypeLabel, formatTime } from './utils';

export default function CalendarView({
  planning = [],
  employees = [],
  currentDate,
  onEditShift,
  onDeleteShift,
  onDateSelect
}) {
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Générer les jours de la semaine
  const generateWeekDays = () => {
    const startDate = new Date(currentDate || Date.now());
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1) + (selectedWeek * 7);
    startDate.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Générer les heures de la journée
  const generateHours = () => {
    const hours = [];
    for (let i = 8; i <= 20; i++) {
      hours.push(i);
    }
    return hours;
  };

  const getShiftsForDateAndHour = (date, hour) => {
    if (!planning || !Array.isArray(planning)) {
      return [];
    }

    const dateStr = date.toISOString().split('T')[0];
    return planning.filter(shift => {
      // Vérification de sécurité
      if (!shift || !shift.date) {
        return false;
      }

      try {
        const shiftDate = new Date(shift.date);
        if (isNaN(shiftDate.getTime())) {
          return false;
        }

        const shiftDateStr = shiftDate.toISOString().split('T')[0];

        // CORRECTION ICI : Utiliser start_time au lieu de startTime
        const startTime = shift.start_time || shift.startTime || '00:00';
        const startHour = parseInt(startTime.split(':')[0]);

        return shiftDateStr === dateStr && startHour === hour;
      } catch (error) {
        console.error('Erreur lors du traitement du shift:', shift, error);
        return false;
      }
    });
  };

  const getEmployeeName = (employeeId) => {
    if (!employeeId || !employees || !Array.isArray(employees)) {
      return 'Non assigné';
    }

    const employee = employees.find(emp => emp && emp.id === employeeId);
    return employee ? (employee.candidate_name || employee.name || employee.employee_name || 'Employé sans nom') : 'Employé inconnu';
  };

  const getEmployeePosition = (employeeId) => {
    if (!employeeId || !employees || !Array.isArray(employees)) {
      return 'Poste non défini';
    }

    const employee = employees.find(emp => emp && emp.id === employeeId);
    return employee ? (employee.position || 'Poste non défini') : 'Poste inconnu';
  };

  const weekDays = generateWeekDays();
  const hours = generateHours();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Calendrier - Semaine {selectedWeek + 1}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* En-tête des jours */}
          <div className="flex border-b border-gray-200">
            <div className="w-24 min-w-[6rem] p-4 border-r border-gray-200"></div>
            {weekDays.map((day, index) => (
              <div key={index} className="flex-1 min-w-[10rem] p-4 border-r border-gray-200 last:border-r-0">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {day.getDate()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                  <button
                    onClick={() => onDateSelect && onDateSelect(day.toISOString().split('T')[0])}
                    className="mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Lignes des heures */}
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-gray-200 last:border-b-0">
              {/* Cellule heure */}
              <div className="w-24 min-w-[6rem] p-3 border-r border-gray-200 bg-gray-50">
                <div className="text-sm font-medium text-gray-700 text-right">
                  {hour}:00
                </div>
              </div>

              {/* Cellules pour chaque jour */}
              {weekDays.map((day, dayIndex) => {
                const shifts = getShiftsForDateAndHour(day, hour);
                return (
                  <div
                    key={dayIndex}
                    className="flex-1 min-w-[10rem] p-2 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 min-h-[80px] relative"
                    onClick={() => onDateSelect && onDateSelect(day.toISOString().split('T')[0])}
                  >
                    {shifts.map((shift, shiftIndex) => {
                      // Vérification de sécurité
                      if (!shift || !shift.id) return null;

                      // CORRECTION ICI : Utiliser start_time et end_time
                      const startTime = shift.start_time || shift.startTime || '00:00';
                      const endTime = shift.end_time || shift.endTime || '00:00';

                      return (
                        <div
                          key={shift.id || shiftIndex}
                          className={`mb-1 p-2 rounded-lg ${getShiftTypeColor(shift.type)} cursor-pointer hover:opacity-90 transition-all`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditShift && onEditShift(shift);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span className="text-xs font-medium truncate">
                                {getEmployeeName(shift.employee_id)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteShift && onDeleteShift(shift.id);
                              }}
                              className="opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs mt-1 flex items-center gap-1">
                            <Clock className="w-2 h-2" />
                            {/* CORRECTION ICI */}
                            {formatTime(startTime)} - {formatTime(endTime)}
                          </div>
                          <div className="text-xs mt-1">
                            {getShiftTypeLabel(shift.type)}
                          </div>
                        </div>
                      );
                    })}

                    {shifts.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDateSelect && onDateSelect(day.toISOString().split('T')[0]);
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          <Plus className="w-3 h-3 inline mr-1" />
                          Shift
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}