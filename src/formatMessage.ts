export interface IGift {
  name: string;
  price?: number;
  link?: string;
  imageUrl?: string;
  description?: string;
}

const formatMessage = ({ name, price, description, link, imageUrl }: IGift) => {
  let message = `<b>${name}</b>`;

  if (price) {
    message += `\nPrice: $${price}`;
  }

  if (link) {
    message += `\n<a href="${link}">Link</a>`;
  }

  if (description) {
    message += `\nDescription: ${description}`;
  }

  if (imageUrl) {
    return {
      imageUrl,
      message,
    };
  }

  return {
    message,
  };
};

export default formatMessage;
