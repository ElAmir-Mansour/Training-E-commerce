import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all data sources
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('chatbot_knowledge')
      .select('*')
      .eq('is_active', true);

    if (knowledgeError) {
      console.error('Error fetching knowledge:', knowledgeError);
    }

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
    }

    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true);

    if (faqsError) {
      console.error('Error fetching FAQs:', faqsError);
    }

    const { data: contactInfo, error: contactError } = await supabase
      .from('contact_info')
      .select('*')
      .eq('is_active', true);

    if (contactError) {
      console.error('Error fetching contact info:', contactError);
    }

    const { data: siteSettings, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Error fetching site settings:', settingsError);
    }

    // Build comprehensive context
    let context = `أنت مساعد ذكي لمنصة ${siteSettings?.site_name || 'التدريب الذكية'}. يمكنك الإجابة على أسئلة المستخدمين بناءً على المعلومات التالية:

=== معلومات الدورات التدريبية ===
`;

    // Add course details
    if (courses && courses.length > 0) {
      courses.forEach((course: any) => {
        context += `
📚 دورة: ${course.title}
👨‍🏫 المدرب: ${course.instructor}
${course.instructor_credentials ? `🎓 مؤهلات المدرب: ${course.instructor_credentials}` : ''}
📝 الوصف: ${course.description}
⏱️ المدة: ${course.duration}
📍 نوع الدورة: ${course.course_type === 'online' ? 'عن بعد' : course.course_type === 'in-person' ? 'حضورية' : 'هجينة'}
${course.start_date ? `📅 تاريخ البدء: ${new Date(course.start_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
${course.end_date ? `📅 تاريخ الانتهاء: ${new Date(course.end_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
${course.registration_deadline ? `⏰ آخر موعد للتسجيل: ${new Date(course.registration_deadline).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
💰 السعر: ${course.is_free ? 'مجانية' : course.discounted_price ? `${course.discounted_price} ريال (بعد الخصم من ${course.original_price} ريال)` : `${course.original_price} ريال`}
📝 حالة التسجيل: ${course.is_registration_closed ? '❌ مغلق' : '✅ مفتوح'}
📊 حالة الدورة: ${course.is_ended ? '✅ انتهت' : '🔄 قادمة أو جارية'}
👥 عدد الطلاب المسجلين: ${course.students || 0}
⭐ التقييم: ${course.rating || 'لا يوجد تقييم بعد'}
${course.course_topics && course.course_topics.length > 0 ? `📌 المواضيع المشمولة: ${course.course_topics.join('، ')}` : ''}
${course.registration_url ? `🔗 رابط التسجيل: ${course.registration_url}` : ''}
${course.is_certificate_active ? '🏆 تمنح شهادة حضور' : ''}
${course.is_platform_active && course.platform_url ? `💻 منصة الدورة: ${course.platform_url}` : ''}
${course.is_recorded_content_active ? '🎥 يتوفر محتوى مسجل' : ''}
━━━━━━━━━━━━━━━━━━━━━
`;
      });
    } else {
      context += "لا توجد دورات متاحة حالياً.\n\n";
    }

    // Add FAQs
    context += `\n=== ❓ الأسئلة الشائعة ===\n`;
    if (faqs && faqs.length > 0) {
      faqs.forEach((faq: any) => {
        context += `\n🔹 السؤال: ${faq.question}\n💡 الإجابة: ${faq.answer}\n`;
      });
    } else {
      context += "لا توجد أسئلة شائعة متوفرة حالياً.\n";
    }

    // Add contact information
    context += `\n\n=== 📞 معلومات التواصل ===\n`;
    if (contactInfo && contactInfo.length > 0) {
      contactInfo.forEach((info: any) => {
        context += `${info.label}: ${info.value}\n`;
      });
    } else {
      context += "لا توجد معلومات تواصل متوفرة حالياً.\n";
    }

    // Add custom knowledge base
    context += `\n\n=== 📚 معلومات وتعليمات إضافية ===\n`;
    if (knowledge && knowledge.length > 0) {
      knowledge.forEach((item: any) => {
        context += `\n🔸 ${item.title}\n${item.content}\n`;
      });
    } else {
      context += "لا توجد معلومات إضافية.\n";
    }

    // Add AI instructions
    context += `\n\n━━━━━━━━━━━━━━━━━━━━━
📋 تعليمات مهمة للإجابة:
━━━━━━━━━━━━━━━━━━━━━

1. ✅ استخدم كل المعلومات المتوفرة أعلاه للإجابة بدقة
2. 🎯 إذا سأل عن دورة معينة، اذكر كل تفاصيلها (المدرب، التاريخ، السعر، المواضيع، حالة التسجيل، إلخ)
3. 👨‍🏫 إذا سأل عن مدرب، اذكر الدورات التي يقدمها ومؤهلاته
4. 💰 إذا سأل عن الأسعار، أعطه معلومات دقيقة وواضحة مع ذكر العروض إن وجدت
5. 📅 إذا سأل عن المواعيد، أعطه التواريخ بالتقويم الهجري والميلادي
6. 🔍 إذا وجدت نفس المعلومة في "المعلومات الإضافية" والبيانات التلقائية، أعط الأولوية للمعلومات الإضافية
7. 🤝 كن مفيداً ومحترماً ومهنياً في ردودك
8. ❌ إذا لم تجد المعلومة المطلوبة، أخبر المستخدم بأدب وانصحه بالتواصل مع الإدارة
9. 📝 قدم إجابات واضحة ومنظمة واستخدم الإيموجي لتسهيل القراءة
10. 💬 إذا كان السؤال غير واضح، اطلب توضيحاً من المستخدم

أجب بالعربية دائماً وبأسلوب احترافي ودود. 🌟`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: context },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد إلى حساب Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "خطأ في الاتصال بالذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "خطأ غير معروف" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
