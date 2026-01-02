export default function getNameFromEmailadress(email_adress: string) {
  const namePart = email_adress.split("@")[0];
  const finalName = namePart.includes(".") ? namePart.split(".")[0] : namePart;
  return finalName.charAt(0).toUpperCase() + finalName.slice(1);
}
