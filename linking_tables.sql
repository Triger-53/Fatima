-- 1. Fix the type mismatch for appointment_id in user_dashboard
-- Appointment.id is bigint, so user_dashboard.appointment_id must also be bigint
ALTER TABLE public.user_dashboard 
ALTER COLUMN appointment_id TYPE bigint USING appointment_id::text::bigint;

-- 2. Add Foreign Key constraints to link tables
-- Link user_dashboard to Appointment
ALTER TABLE public.user_dashboard
DROP CONSTRAINT IF EXISTS user_dashboard_appointment_id_fkey;
ALTER TABLE public.user_dashboard
ADD CONSTRAINT user_dashboard_appointment_id_fkey 
FOREIGN KEY (appointment_id) REFERENCES public."Appointment" (id) ON DELETE SET NULL;


-- 2.1 Add meet_link column to Appointment table
ALTER TABLE public."Appointment" ADD COLUMN IF NOT EXISTS meet_link text;

-- 2.2 Add meet_link column to user_dashboard table
ALTER TABLE public.user_dashboard ADD COLUMN IF NOT EXISTS meet_link text;


-- 3. Create a function to handle new user setup (Profiles & Dashboard)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');

  -- Create User Dashboard
  INSERT INTO public.user_dashboard (user_id, email)
  VALUES (new.id, new.email);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to run handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create a function to sync Appointment data to User Dashboard
CREATE OR REPLACE FUNCTION public.sync_appointment_to_dashboard()
RETURNS trigger AS $$
BEGIN
  UPDATE public.user_dashboard
  SET 
    "firstName" = new."firstName",
    "lastName" = new."lastName",
    phone = new.phone::numeric,
    "dateOfBirth" = new."dateOfBirth",
    gender = new.gender,
    allergies = new.allergies,
    "medicalHistory" = new."medicalHistory",
    appointment_id = new.id,
    meet_link = new.meet_link
  WHERE user_id = new.user_id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to sync dashboard when an appointment is created or updated
DROP TRIGGER IF EXISTS on_appointment_created_sync ON public."Appointment";
CREATE TRIGGER on_appointment_created_sync
  AFTER INSERT OR UPDATE ON public."Appointment"
  FOR EACH ROW EXECUTE FUNCTION public.sync_appointment_to_dashboard();
