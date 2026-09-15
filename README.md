# church-gc

Painel de GC para igrejas com operação simples, moderna e integração com vMix.

## Visão do produto

O sistema separa preparação e operação ao vivo. O PC do vMix pode ficar dedicado à transmissão enquanto outro computador na mesma rede opera o GC.

### MVP
- Modo Preparação e Modo Culto
- GC de pessoas (nome + função)
- Bíblia (referência + texto)
- Louvor (versos, refrões e ponte)
- Oferta (PIX, QR Code, campanhas)
- Avisos e eventos
- GC livre
- Preview antes de colocar no ar
- Estado NO AR / PRÓXIMO
- Biblioteca de templates
- Atalhos de teclado
- Bridge local para comunicação com a API HTTP do vMix

## Direção visual
Interface clara, leve e funcional. Sem degradês, glassmorphism ou excesso de efeitos. Hierarquia forte, sidebar compacta, superfícies discretas e foco em operação rápida durante o culto.

## Arquitetura inicial
- `apps/panel`: interface web do operador
- `apps/bridge`: serviço local no computador/rede do vMix
- `packages/core`: tipos, contratos e regras compartilhadas
- `packages/vmix`: cliente e comandos para a API do vMix

> Status: estrutura inicial em desenvolvimento.
