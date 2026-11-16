import { getAllDossiers, getHubSettings } from '@/app/actions/dossier'; 
import DossiersHubClientPage from './DossiersHubClientPage'; 
import { constructPageMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata() {
  const hubSettingsRes = await getHubSettings();
  const hubSettings = hubSettingsRes || {};

  const finalTitle = hubSettings.metaTitle || hubSettings.seoTitle || hubSettings.title || 'منظومه‌های محتوایی مکتوم';
  const finalDescription = hubSettings.metaDesc || hubSettings.description || 'پایگاه داده جامع منظومه‌های محتوایی و پرونده‌های ویژه شبکه مکتوم';

  return constructPageMetadata({
    title: finalTitle,
    description: finalDescription,
    path: '/c',
    ogImage: hubSettings.bgDesktop || undefined,
  });
}

export default async function HubPage() {
  const [hubSettingsRes, dossiersRes] = await Promise.all([
    getHubSettings(),
    getAllDossiers()
  ]);

  const dossiers = dossiersRes?.success ? dossiersRes.data : [];
  const hubSettings = hubSettingsRes || {};

  return (
    <DossiersHubClientPage 
      hubSettings={hubSettings} 
      dossiers={dossiers} 
    />
  );
}