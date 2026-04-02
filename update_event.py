import sys

with open('c:/Users/sami/Desktop/bagspackgo/src/components/home/EventSection/EventDetails.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '// ── BOOKING VIEW ──' in line:
        start_idx = i
    if '/* ═══════════════════ DETAILS VIEW ═══════════════════ */' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_content = """  // ── BOOKING VIEW ──
  if (currentView === 'booking') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F7F9FC] overflow-y-auto w-full h-full">
        {/* Simple, sleek top header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <button
              onClick={() => { setCurrentView('details'); setBookingStep(1); }}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 font-semibold transition-colors group px-2 py-1"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="hidden sm:inline">Back to Event</span>
            </button>
            <div className="flex flex-col items-end">
              <h1 className="text-gray-900 font-bold text-sm sm:text-lg truncate max-w-[200px] sm:max-w-md">{event.name}</h1>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-10 max-w-lg mx-auto">
             <div className="flex flex-col items-center">
               <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-colors shadow-sm ${bookingStep >= 1 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-gray-200 text-gray-500'}`}>1</div>
               <p className={`mt-2 text-xs sm:text-sm font-semibold ${bookingStep >= 1 ? 'text-emerald-700' : 'text-gray-500'}`}>Details</p>
             </div>
             <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${bookingStep >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
             <div className="flex flex-col items-center">
               <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-colors shadow-sm ${bookingStep >= 2 ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-gray-200 text-gray-500'}`}>2</div>
               <p className={`mt-2 text-xs sm:text-sm font-semibold ${bookingStep >= 2 ? 'text-emerald-700' : 'text-gray-500'}`}>Review & Pay</p>
             </div>
          </div>

          {bookingStep === 1 ? (
             <div className="flex flex-col lg:flex-row gap-8 items-start">
               {/* ── Form Details (Left) ── */}
               <div className="w-full lg:w-[65%] space-y-6">
                 
                 {/* Card: Number of Participants */}
                 <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                       <h2 className="text-xl font-bold text-gray-900 mb-1">How many people are coming?</h2>
                       <p className="text-gray-500 text-sm font-medium">₹{event.price?.toLocaleString()} per person</p>
                     </div>
                     <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                       <button onClick={() => setBookingSlots(s => Math.max(1, s - 1))} className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95">
                         <Minus size={18} />
                       </button>
                       <span className="w-8 text-center text-2xl font-bold text-gray-900">{bookingSlots}</span>
                       <button onClick={() => setBookingSlots(s => Math.min(event.slotsLeft || 50, s + 1))} className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95">
                         <Plus size={18} />
                       </button>
                     </div>
                   </div>
                 </div>

                 {/* Card: Pickup Point */}
                 {event.pickupPoints?.length > 0 && (
                   <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                     <h2 className="text-xl font-bold text-gray-900 mb-4">Select Pickup Point</h2>
                     <div className="relative">
                        <button
                          type="button"
                          onClick={() => setPickupDropdownOpen(!pickupDropdownOpen)}
                          className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-all bg-white shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/50 ${selectedPickup ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-200 hover:border-emerald-300'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <MapPin size={18} className={selectedPickup ? 'text-emerald-500' : 'text-gray-400'} />
                            {selectedPickup ? (
                              <div className="min-w-0 text-left">
                                <p className="font-semibold text-gray-900 text-sm truncate">{selectedPickup}</p>
                                {selectedPickupObj?.time && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                                    <Clock size={12} /> {selectedPickupObj.time}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Choose a pickup location...</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedPickupObj?.link && (
                              <a
                                href={selectedPickupObj.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-xs font-semibold transition-all focus:outline-none"
                              >
                                <Navigation size={12} /> <span className="hidden sm:inline">Map</span>
                              </a>
                            )}
                            <ChevronDown size={18} className={`text-gray-400 transition-transform ${pickupDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
  
                        <AnimatePresence>
                          {pickupDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                              className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 max-h-60 overflow-y-auto"
                            >
                              {event.pickupPoints.map((point, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => { setSelectedPickup(point.location); setPickupDropdownOpen(false); }}
                                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between gap-3 ${selectedPickup === point.location ? 'bg-emerald-50/60 text-emerald-800' : 'hover:bg-gray-50 text-gray-700'}`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <MapPin size={16} className={selectedPickup === point.location ? 'text-emerald-500' : 'text-gray-400'} />
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm truncate">{point.location}</p>
                                      {point.time && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                          <Clock size={11} /> {point.time}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {selectedPickup === point.location && <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                   </div>
                 )}

                 {/* Card: Primary Contact */}
                 <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                   <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
                   <p className="text-gray-500 text-sm mb-6 font-medium">Booking confirmation & tickets will be sent here.</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                          <input type="email" placeholder="your@email.com" value={formData.contactDetails.email} onChange={e => handleContactChange('email', e.target.value)}
                            className="pl-10 w-full p-2.5 sm:p-3 border rounded-xl outline-none text-sm border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                          <input type="tel" placeholder="9876543210" value={formData.contactDetails.phone} onChange={e => handleContactChange('phone', e.target.value)}
                            className="pl-10 w-full p-2.5 sm:p-3 border rounded-xl outline-none text-sm border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white" maxLength="10" />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Card: Travellers */}
                 <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                   <h2 className="text-xl font-bold text-gray-900 mb-1">Traveller Details</h2>
                   <p className="text-gray-500 text-sm mb-6 font-medium">Required by the organizer for verification & permits.</p>
                   <div className="space-y-4">
                      {Array.from({ length: bookingSlots }).map((_, i) => {
                        const p = formData.participants[i] || {};
                        const isExpanded = expandedSections[i] || (bookingSlots === 1);
                        const isFilled = p.name && p.age && p.gender;
  
                        return (
                          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all group">
                            <button
                              onClick={() => toggleSection(i)}
                              className={`w-full flex justify-between items-center p-4 sm:p-5 transition-colors ${isExpanded ? 'bg-emerald-50/40 border-b border-gray-200 cursor-default' : isFilled ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors shadow-sm font-bold text-sm ${isFilled ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-white border border-gray-300 text-gray-500 group-hover:border-emerald-300 group-hover:text-emerald-500'}`}>
                                  {isFilled ? <CheckCircle className="w-4 h-4" /> : (i + 1)}
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-gray-900">Traveller {i + 1}</p>
                                  {!isExpanded && isFilled && (
                                    <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                                      {p.name} · Age {p.age} · {p.gender?.charAt(0).toUpperCase() + p.gender?.slice(1)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </motion.div>
                            </button>
  
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white">
                                    <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name <span className="text-emerald-500">*</span></label>
                                      <input placeholder="As per official ID" value={p.name || ''} onChange={e => handleParticipantChange(i, 'name', e.target.value)}
                                        className={selectClassName} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Age <span className="text-emerald-500">*</span></label>
                                      <input placeholder="Enter age" type="number" min="1" max="100" value={p.age || ''} onChange={e => handleParticipantChange(i, 'age', e.target.value)}
                                        className={selectClassName} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Gender <span className="text-emerald-500">*</span></label>
                                      <CustomSelect
                                        value={p.gender || ''}
                                        onChange={(val) => handleParticipantChange(i, 'gender', val)}
                                        options={[
                                          { value: 'male', label: 'Male' },
                                          { value: 'female', label: 'Female' },
                                          { value: 'other', label: 'Other' }
                                        ]}
                                        placeholder="Select Gender"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                                      <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                                        <input placeholder="Optional phone" type="tel" maxLength="10" value={p.phone || ''} onChange={e => handleParticipantChange(i, 'phone', e.target.value)}
                                          className={`${selectClassName} pl-10`} />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nationality <span className="text-emerald-500">*</span></label>
                                      <input placeholder="E.g., Indian" value={p.nationality || ''} onChange={e => handleParticipantChange(i, 'nationality', e.target.value)}
                                        className={selectClassName} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ID Type <span className="text-emerald-500">*</span></label>
                                      <CustomSelect
                                        value={p.idType || ''}
                                        onChange={(val) => handleParticipantChange(i, 'idType', val)}
                                        options={[
                                          { value: 'aadhar', label: 'Aadhar Card' },
                                          { value: 'pan', label: 'PAN Card' },
                                          { value: 'voter', label: 'Voter ID' },
                                          { value: 'passport', label: 'Passport' },
                                          { value: 'dl', label: 'Driving License' }
                                        ]}
                                        placeholder="Select ID Proof"
                                      />
                                    </div>
                                    {p.idType && (
                                      <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ID Number <span className="text-emerald-500">*</span></label>
                                        <input placeholder="Enter ID number" value={p.idNumber || ''} onChange={e => handleParticipantChange(i, 'idNumber', e.target.value)}
                                          className={selectClassName} />
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                 </div>

               </div>

               {/* ── Summary Sticky Block (Right) ── */}
               <div className="w-full lg:w-[35%] lg:sticky lg:top-28">
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/40 overflow-hidden">
                   <div className="p-6 border-b border-gray-100 bg-white">
                     <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
                     <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 shadow-sm">
                          <img src={event.image || '/images/EventCover.webp'} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm line-clamp-2">{event.name}</p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">{formattedDate}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1"><MapPin size={10} /> {event.destinationId}</p>
                        </div>
                     </div>
                     <div className="space-y-3.5 text-sm text-gray-600 font-medium bg-white">
                       <div className="flex justify-between">
                         <span>Tickets ({bookingSlots}x)</span>
                         <span className="text-gray-900">₹{(event.price * bookingSlots).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center group cursor-pointer">
                         <span className="border-b border-dashed border-gray-300 group-hover:border-gray-500 transition-colors">Taxes & Fees</span>
                         <span className="text-gray-900">₹{Math.round(event.price * bookingSlots * 0.05).toLocaleString()}</span>
                       </div>
                     </div>
                   </div>
                   <div className="p-6 bg-[#FAFAFA]">
                     <div className="flex justify-between items-end mb-6">
                       <span className="font-bold text-gray-900">Total Price</span>
                       <span className="text-3xl font-black text-emerald-600 leading-none">₹{Math.round(event.price * bookingSlots * 1.05).toLocaleString()}</span>
                     </div>
                     <button onClick={handleReviewJourney} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-lg flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                       Continue to Review <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </button>
                     <p className="text-[11px] text-gray-500 text-center mt-4 flex items-center justify-center gap-1 font-medium"><ShieldCheck size={12} className="text-emerald-600"/> Safe and secure transaction</p>
                   </div>
                 </div>
               </div>
             </div>
          ) : (
             <div className="max-w-3xl mx-auto">
               {/* ── Review Journey View ── */}
               <div className="bg-white rounded-[2rem] border border-gray-200 shadow-2xl shadow-emerald-900/5 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mx-32 -my-32 pointer-events-none" />
                 
                 <div className="p-8 sm:p-12 relative z-10">
                   <div className="text-center mb-10">
                     <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-5 -rotate-3 border border-emerald-100 shadow-sm">
                       <Ticket size={36} />
                     </div>
                     <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Review Booking</h2>
                     <p className="text-gray-500 font-medium">Verify your details before proceeding to payment.</p>
                   </div>

                   <div className="bg-gray-50/50 rounded-2xl p-6 sm:p-8 border border-gray-100 mb-8 space-y-6">
                     <div className="flex flex-col sm:flex-row gap-6">
                       <div className="flex-1">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 w-max">Event Name</p>
                         <p className="font-bold text-gray-900 text-base sm:text-lg leading-tight">{event.name}</p>
                       </div>
                       <div className="flex-1">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 w-max">Date</p>
                         <p className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2"><Calendar size={18} className="text-emerald-500" /> {formattedDate}</p>
                       </div>
                     </div>

                     {selectedPickup && (
                       <div className="pt-5 border-t border-gray-200">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 w-max">Pickup Information</p>
                         <div className="flex items-center gap-3 font-semibold text-gray-900 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                           <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                             <MapPin size={20} className="text-emerald-500" />
                           </div>
                           <div>
                             <p className="text-gray-900 text-sm sm:text-base">{selectedPickup}</p>
                             {selectedPickupObj?.time && <p className="text-gray-500 text-xs sm:text-sm font-medium mt-0.5 flex items-center gap-1"><Clock size={12} /> {selectedPickupObj.time}</p>}
                           </div>
                         </div>
                       </div>
                     )}

                     <div className="pt-5 border-t border-gray-200">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 w-max">Travellers ({bookingSlots})</p>
                       <div className="space-y-3">
                         {Array.from({ length: bookingSlots }).map((_, i) => (
                           <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-2">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 border border-gray-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                 {i + 1}
                               </div>
                               <span className="font-bold text-gray-900 text-base truncate">{formData.participants[i]?.name}</span>
                             </div>
                             <div className="sm:text-right pl-11 sm:pl-0">
                               <span className="text-gray-500 font-medium capitalize flex flex-col sm:block text-xs sm:text-sm">
                                 {formData.participants[i]?.gender} <span className="hidden sm:inline mx-1">·</span> Age {formData.participants[i]?.age}
                               </span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>

                   <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 sm:p-8 mb-8">
                     <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-4 w-max">Payment Summary</p>
                     <div className="space-y-3.5 text-gray-700 font-medium text-sm sm:text-base">
                       <div className="flex justify-between">
                         <span>Ticket Subtotal ({bookingSlots} {bookingSlots===1 ? 'slot' : 'slots'})</span>
                         <span className="text-gray-900">₹{(event.price * bookingSlots).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Platform Convenience Fees (5%)</span>
                         <span className="text-gray-900">₹{Math.round(event.price * bookingSlots * 0.05).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-end pt-5 mt-2 border-t border-emerald-200">
                         <span className="text-lg sm:text-xl font-bold text-gray-900">Total Payable</span>
                         <span className="text-3xl sm:text-4xl font-black text-emerald-600 leading-none">₹{Math.round(event.price * bookingSlots * 1.05).toLocaleString()}</span>
                       </div>
                     </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={() => setBookingStep(1)} className="order-2 sm:order-1 w-full sm:w-1/3 py-4 sm:py-5 font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl transition-colors border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
                       Edit Details
                     </button>
                     <button onClick={handleBooking} disabled={isProcessingPayment} className="order-1 sm:order-2 w-full sm:w-2/3 bg-gray-900 hover:bg-black text-white font-bold py-4 sm:py-5 rounded-xl transition-all shadow-xl shadow-gray-900/20 text-lg flex items-center justify-center gap-3 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-80">
                       {isProcessingPayment ? (
                         <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Securely Processing...</span>
                       ) : (
                         <><ShieldCheck size={24} className="text-emerald-400" /> Pay Securely Now</>
                       )}
                     </button>
                   </div>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    );
  }
"""

    lines = lines[:start_idx] + [new_content + '\n'] + lines[end_idx:]
    with open('c:/Users/sami/Desktop/bagspackgo/src/components/home/EventSection/EventDetails.jsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('Replaced content successfully')
else:
    print('Failed to find start or end index')
