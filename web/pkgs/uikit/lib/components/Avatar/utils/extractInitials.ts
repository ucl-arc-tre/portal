const extractInitials = (name: string) => {
  if (
    typeof name !== 'string' ||
    name === '' ||
    name === null ||
    name === undefined
  ) {
    return '';
  }

  const nameArray = name.trim().split(' ');
  if (nameArray.length === 1) {
    return nameArray[0].charAt(0).toUpperCase();
  } else if (nameArray.length >= 2) {
    return (
      nameArray[0].charAt(0).toUpperCase() +
      nameArray[nameArray.length - 1].charAt(0).toUpperCase()
    );
  } else {
    return '';
  }
};

export default extractInitials;
