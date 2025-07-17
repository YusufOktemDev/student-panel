import React, { useState } from "react";

export default function CourseDetail({ seciliDers, geriDon }) {
  const [icerikler, setIcerikler] = useState(seciliDers.icerikler || []);
  const [yeniIcerik, setYeniIcerik] = useState({
    baslik: "",
    aciklama: "",
    pdf: "",
  });

  const handleIcerikEkle = () => {
    if (!yeniIcerik.baslik || !yeniIcerik.aciklama) return;
    setIcerikler([...icerikler, yeniIcerik]);
    setYeniIcerik({ baslik: "", aciklama: "", pdf: "" });
  };

  const handleIcerikSil = (index) => {
    const yeniListe = [...icerikler];
    yeniListe.splice(index, 1);
    setIcerikler(yeniListe);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow max-w-3xl mx-auto">
      <button
        onClick={geriDon}
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4"
      >
        ← Geri dön
      </button>

      <h2 className="text-2xl font-bold mb-2">{seciliDers.ad}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {seciliDers.aciklama}
      </p>

      {}
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-6">
        <h3 className="text-lg font-semibold mb-2">İçerik Ekle</h3>
        <input
          type="text"
          placeholder="Başlık"
          value={yeniIcerik.baslik}
          onChange={(e) =>
            setYeniIcerik({ ...yeniIcerik, baslik: e.target.value })
          }
          className="w-full mb-2 p-2 rounded border bg-white dark:bg-gray-800 text-black dark:text-white"
        />
        <textarea
          placeholder="Açıklama"
          rows={2}
          value={yeniIcerik.aciklama}
          onChange={(e) =>
            setYeniIcerik({ ...yeniIcerik, aciklama: e.target.value })
          }
          className="w-full mb-2 p-2 rounded border bg-white dark:bg-gray-800 text-black dark:text-white"
        />
        <input
          type="text"
          placeholder="PDF Link (opsiyonel)"
          value={yeniIcerik.pdf}
          onChange={(e) =>
            setYeniIcerik({ ...yeniIcerik, pdf: e.target.value })
          }
          className="w-full mb-2 p-2 rounded border bg-white dark:bg-gray-800 text-black dark:text-white"
        />
        <button
          onClick={handleIcerikEkle}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          İçeriği Ekle
        </button>
      </div>

      {}
      <h3 className="text-lg font-semibold mb-2">Ders İçerikleri:</h3>
      {icerikler.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          Henüz içerik eklenmedi.
        </p>
      )}
      <ul className="space-y-4">
        {icerikler.map((icerik, index) => (
          <li
            key={index}
            className="bg-gray-100 dark:bg-gray-700 p-4 rounded flex flex-col md:flex-row justify-between md:items-center"
          >
            <div>
              <p className="font-semibold">{icerik.baslik}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {icerik.aciklama}
              </p>
              {icerik.pdf && (
                <a
                  href={icerik.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-300 underline mt-1 inline-block"
                >
                  📎 PDF'yi Görüntüle
                </a>
              )}
            </div>
            <button
              onClick={() => handleIcerikSil(index)}
              className="mt-2 md:mt-0 text-red-500 text-sm hover:underline"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Son Güncelleme: {seciliDers.tarih}
      </p>
    </div>
  );
}
