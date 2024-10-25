export default function getFullName(user) {
  let firstName = user?.personal?.firstName ?? '';
  const lastName = user?.personal?.lastName ?? '';
  const middleName = user?.personal?.middleName ?? '';
  const preferredFirstName = user?.personal?.preferredFirstName ?? '';

  if (preferredFirstName && firstName) {
    firstName = `${preferredFirstName} (${firstName})`;
  }

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}
