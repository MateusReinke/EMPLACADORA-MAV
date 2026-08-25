import { useEffect, useState } from "react";

import { REVIEWS_ENDPOINT, type GoogleReviewsPayload } from "@/content/site";

/**
 * Uma única requisição por carregamento de página, compartilhada entre o selo
 * do hero e a seção de avaliações. Sem esse cache de módulo, os dois
 * componentes bateriam no endpoint em paralelo pedindo a mesma coisa.
 */
let pending: Promise<GoogleReviewsPayload | null> | null = null;

const load = () => {
  if (!pending) {
    pending = fetch(REVIEWS_ENDPOINT)
      // 204 = endpoint existe mas não está configurado; corpo vazio, sem JSON.
      .then((response) =>
        response.ok && response.status !== 204 ? response.json() : null
      )
      .catch(() => null);
  }

  return pending;
};

/** Avaliações do Google, ou `null` enquanto carrega / se não houver. */
export const useGoogleReviews = () => {
  const [data, setData] = useState<GoogleReviewsPayload | null>(null);

  useEffect(() => {
    let active = true;

    load().then((payload) => {
      if (active && payload?.reviews?.length) setData(payload);
    });

    return () => {
      active = false;
    };
  }, []);

  return data;
};
