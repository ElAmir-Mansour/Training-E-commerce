import { supabase } from "@/integrations/supabase/client";

export const fetchSiteSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateSiteSettings = async (
  siteName: string, 
  logoUrl: string | null,
  heroImageUrl?: string | null,
  showHeroImage?: boolean
) => {
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existing) {
    const updates: any = { site_name: siteName, logo_url: logoUrl };
    if (heroImageUrl !== undefined) updates.hero_image_url = heroImageUrl;
    if (showHeroImage !== undefined) updates.show_hero_image = showHeroImage;
    
    const { error } = await supabase
      .from('site_settings')
      .update(updates)
      .eq('id', existing.id);
    
    if (error) throw error;
  }
};

export const fetchCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchCourseById = async (id: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateCourse = async (
  id: string,
  updates: {
    title?: string;
    description?: string;
    image_url?: string;
    instructor?: string;
    instructor_credentials?: string;
    duration?: string;
    registration_url?: string;
    additional_images?: string[];
    is_registration_closed?: boolean;
    is_ended?: boolean;
    course_topics?: string[];
    certificate_url?: string;
    is_certificate_active?: boolean;
    video_url?: string;
    course_materials?: Array<{ name: string; file_url: string }>;
    is_free?: boolean;
    original_price?: number;
    discounted_price?: number;
    course_type?: 'in-person' | 'online' | 'asynchronous';
    platform_url?: string;
    is_platform_active?: boolean;
    recorded_content_url?: string;
    recorded_content_urls?: string[];
    recorded_content_type?: 'youtube' | 'vimeo' | 'google_drive' | 'external_video' | 'external_audio';
    is_recorded_content_active?: boolean;
    start_date?: string;
    end_date?: string;
    registration_deadline?: string;
  }
) => {
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const addCourse = async (course: {
  title: string;
  description: string;
  image_url: string;
  instructor: string;
  instructor_credentials?: string;
  duration: string;
  registration_url?: string;
  students?: number;
  rating?: number;
  additional_images?: string[];
  is_registration_closed?: boolean;
  course_topics?: string[];
  certificate_url?: string;
  is_certificate_active?: boolean;
  video_url?: string;
  course_materials?: Array<{ name: string; file_url: string }>;
  is_free?: boolean;
  original_price?: number;
  discounted_price?: number;
  course_type?: 'in-person' | 'online' | 'asynchronous';
  platform_url?: string;
  is_platform_active?: boolean;
  recorded_content_url?: string;
  recorded_content_type?: 'youtube' | 'vimeo' | 'google_drive' | 'external_video' | 'external_audio';
  is_recorded_content_active?: boolean;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
}) => {
  const { error } = await supabase
    .from('courses')
    .insert([course]);
  
  if (error) throw error;
};

export const deleteCourse = async (id: string) => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Calendar Functions
export const fetchCoursesByDateRange = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())
    .order('start_date', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const fetchUpcomingCourses = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

export const fetchCoursesForMonth = async (year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .gte('start_date', startDate.toISOString())
    .lte('start_date', endDate.toISOString())
    .order('start_date', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Chatbot Knowledge Base Functions
export const fetchChatbotKnowledge = async () => {
  const { data, error } = await supabase
    .from('chatbot_knowledge')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addChatbotKnowledge = async (knowledge: {
  title: string;
  content: string;
  category: string;
  is_active?: boolean;
}) => {
  const { error } = await supabase
    .from('chatbot_knowledge')
    .insert([knowledge]);
  
  if (error) throw error;
};

export const updateChatbotKnowledge = async (
  id: string,
  updates: {
    title?: string;
    content?: string;
    category?: string;
    is_active?: boolean;
  }
) => {
  const { error } = await supabase
    .from('chatbot_knowledge')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteChatbotKnowledge = async (id: string) => {
  const { error } = await supabase
    .from('chatbot_knowledge')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Contact Info Functions
export const fetchContactInfo = async () => {
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addContactInfo = async (contactInfo: {
  type: 'phone' | 'email' | 'whatsapp' | 'telegram';
  value: string;
  label: string;
  is_active?: boolean;
}) => {
  const { error } = await supabase
    .from('contact_info')
    .insert([contactInfo]);
  
  if (error) throw error;
};

export const updateContactInfo = async (
  id: string,
  updates: {
    type?: 'phone' | 'email' | 'whatsapp' | 'telegram';
    value?: string;
    label?: string;
    is_active?: boolean;
  }
) => {
  const { error } = await supabase
    .from('contact_info')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteContactInfo = async (id: string) => {
  const { error } = await supabase
    .from('contact_info')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Evaluation Forms Functions
export const fetchEvaluationForms = async () => {
  const { data, error } = await supabase
    .from('evaluation_forms')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchEvaluationFormByCourseId = async (courseId: string) => {
  const { data, error } = await supabase
    .from('evaluation_forms')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const addEvaluationForm = async (form: {
  course_id: string;
  form_title: string;
  form_questions: any;
  is_active?: boolean;
}) => {
  const { error } = await supabase
    .from('evaluation_forms')
    .insert([form]);
  
  if (error) throw error;
};

export const updateEvaluationForm = async (
  id: string,
  updates: {
    form_title?: string;
    form_questions?: any;
    is_active?: boolean;
  }
) => {
  const { error } = await supabase
    .from('evaluation_forms')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteEvaluationForm = async (id: string) => {
  const { error } = await supabase
    .from('evaluation_forms')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Evaluation Responses Functions
export const fetchEvaluationResponses = async (courseId?: string) => {
  let query = supabase
    .from('evaluation_responses')
    .select('*')
    .order('submitted_at', { ascending: false });
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const addEvaluationResponse = async (response: {
  form_id: string;
  course_id: string;
  trainee_name: string;
  trainee_email?: string;
  trainee_phone?: string;
  responses: any;
}) => {
  const { error } = await supabase
    .from('evaluation_responses')
    .insert([response]);
  
  if (error) throw error;
};

export const fetchEvaluationStats = async (courseId: string) => {
  const { data, error } = await supabase
    .from('evaluation_responses')
    .select('responses')
    .eq('course_id', courseId);
  
  if (error) throw error;
  return data;
};

// Course Suggestions
export const fetchCourseSuggestions = async () => {
  const { data, error } = await supabase
    .from('course_suggestions')
    .select('*')
    .order('votes_count', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addCourseSuggestion = async (suggestion: any) => {
  const { error } = await supabase
    .from('course_suggestions')
    .insert(suggestion);
  
  if (error) throw error;
};

export const updateCourseSuggestion = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('course_suggestions')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteCourseSuggestion = async (id: string) => {
  const { error } = await supabase
    .from('course_suggestions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const voteForSuggestion = async (suggestionId: string, voterIdentifier: string) => {
  const { error } = await supabase
    .from('course_suggestion_votes')
    .insert({ suggestion_id: suggestionId, voter_identifier: voterIdentifier });
  
  if (error) throw error;

  // @ts-ignore - Database function will be available after types regenerate
  const { error: updateError } = await supabase.rpc('increment_suggestion_votes', { suggestion_id: suggestionId });
  if (updateError) throw updateError;
};

// Course Polls
export const fetchCoursePolls = async () => {
  const { data, error } = await supabase
    .from('course_polls')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchAllCoursePolls = async () => {
  const { data, error } = await supabase
    .from('course_polls')
    .select('*')
    .order('votes_count', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addCoursePoll = async (poll: any) => {
  const { error } = await supabase
    .from('course_polls')
    .insert(poll);
  
  if (error) throw error;
};

export const updateCoursePoll = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('course_polls')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteCoursePoll = async (id: string) => {
  const { error } = await supabase
    .from('course_polls')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const voteForPoll = async (
  pollId: string, 
  voterIdentifier: string,
  voterInfo?: {
    name?: string;
    job?: string;
    city?: string;
    phone?: string;
    email?: string;
  }
) => {
  const { error } = await supabase
    .from('course_poll_votes')
    .insert({ 
      poll_id: pollId, 
      voter_identifier: voterIdentifier,
      voter_name: voterInfo?.name || null,
      voter_job: voterInfo?.job || null,
      voter_city: voterInfo?.city || null,
      voter_phone: voterInfo?.phone || null,
      voter_email: voterInfo?.email || null,
    });
  
  if (error) throw error;

  // @ts-ignore - Database function will be available after types regenerate
  const { error: updateError } = await supabase.rpc('increment_poll_votes', { poll_id: pollId });
  if (updateError) throw updateError;
};

export const hasVotedForPoll = async (pollId: string, voterIdentifier: string) => {
  const { data, error } = await supabase
    .from('course_poll_votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('voter_identifier', voterIdentifier)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};

export const hasVotedForSuggestion = async (suggestionId: string, voterIdentifier: string) => {
  const { data, error } = await supabase
    .from('course_suggestion_votes')
    .select('id')
    .eq('suggestion_id', suggestionId)
    .eq('voter_identifier', voterIdentifier)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};

// User roles management
export const checkUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) {
    console.error('Error checking user role:', error);
    return null;
  }

  return data;
};

export const assignAdminRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role: 'admin' }])
    .select();

  if (error) {
    console.error('Error assigning admin role:', error);
    throw error;
  }

  return data;
};

// Fetch poll voters with their information
export const fetchPollVoters = async (pollId: string) => {
  const { data, error } = await supabase
    .from("course_poll_votes")
    .select("*")
    .eq("poll_id", pollId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
