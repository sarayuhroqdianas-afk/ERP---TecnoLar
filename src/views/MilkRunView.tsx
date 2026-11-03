import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Play,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/formulas';

export const MilkRunView: React.FC = () => {
  const {
    milkRunTrips,
    performMilkRunCheckIn,
    performMilkRunCheckOut,
  } = useApp();

  const onTimeCount = milkRunTrips.filter((t) => t.onTime).length;
  const onTimeDeliveryRate = ((onTimeCount / milkRunTrips.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Logística Interna &amp; Abastecimento
            </span>
            <span className="bg-sky-950 text-sky-300 border border-sky-800 text-[10px] px-2 py-0.5 rounded font-bold">
              Circuito Fixo: 400 Metros
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Controle do Circuito Milk Run (Almoxarifado ↔ Linhas de Produção)
          </h2>
          <p className="text-xs text-slate-400">
            Eliminação das paradas por falta de sincronismo e movimentações sem horário (histórico de 12 ocorrências e 6h paradas = R$ 132.000).
          </p>
        </div>

        {/* KPI de Cumprimento de Horário */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block">Cumprimento de Horário (OTD):</span>
            <strong className="text-lg font-black text-sky-400">{onTimeDeliveryRate}%</strong>
          </div>
          <div className="text-right text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            <span>Tempo Médio Trajeto: <strong>11 min</strong></span><br />
            <span>Janela de Ciclo: <strong>45 min</strong></span>
          </div>
        </div>
      </div>

      {/* Cartão de Alerta do Diagnóstico da Empresa */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <strong className="text-white block text-sm">
              Impacto Pré-Milk Run: 12 ocorrências, 6 horas paradas e R$ 132.000 em prejuízo
            </strong>
            <span>
              A distância de 400 metros entre o almoxarifado central e as linhas 1 e 2 operava sem janelas pré-definidas. Com o sistema Milk Run programado, os rebocadores operam em rotas sincronizadas com check-in e check-out por RFID/coletor.
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Viagens do Milk Run */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Grade de Abastecimento Programado do Dia (Turnos 1 e 2)
          </span>
          <span className="text-slate-400">
            Total: <strong>{milkRunTrips.length} Viagens Diárias</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Código / Horário</th>
                <th className="py-3 px-4">Origem / Destino (400m)</th>
                <th className="py-3 px-4">Rebocador &amp; Operador</th>
                <th className="py-3 px-4 text-center">Itens Abastecidos</th>
                <th className="py-3 px-4 text-center">Horário Partida / Chegada</th>
                <th className="py-3 px-4 text-center">Status da Viagem</th>
                <th className="py-3 px-4 text-right">Controle de Linha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {milkRunTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-sky-400 block">{trip.code}</span>
                    <span className="text-slate-300 font-semibold">{trip.time}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <span>{trip.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-sky-300">{trip.destination}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Distância: {trip.distanceMeters} metros</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-200">{trip.operatorName}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{trip.cartId}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {trip.itemsDeliveredCount} caixas/peças
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-300">
                    {trip.departureTime ? `Partida: ${trip.departureTime}` : 'Aguardando'}
                    <span className="block text-slate-400">
                      {trip.arrivalTime ? `Chegada: ${trip.arrivalTime}` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        trip.status === 'Concluído'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : trip.status === 'Em Trânsito (400m)'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse'
                          : trip.status === 'Atrasado'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {trip.status === 'Programado' && (
                        <button
                          type="button"
                          onClick={() => performMilkRunCheckIn(trip.id)}
                          className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Check-In Partida</span>
                        </button>
                      )}
                      {trip.status === 'Em Trânsito (400m)' && (
                        <button
                          type="button"
                          onClick={() => performMilkRunCheckOut(trip.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Check-Out Chegada</span>
                        </button>
                      )}
                      {trip.status === 'Concluído' && (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Entregue
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
